import webapp2
import re

from google.appengine.api import memcache
from google.appengine.ext import ndb
from google.appengine.ext import db

from google.appengine.api import urlfetch
from xml.etree import ElementTree as etree

import base64
import logging

DEFAULT_CONTENT_NAME = 'default_CONTENT'
POEM_CONTENT_NAME = 'default_CONTENT'

def contents_key(contents_name=DEFAULT_CONTENT_NAME):
    """Constructs a Datastore key for a Contents entity with contents_name."""
    return db.Key.from_path('Plinko_contents', contents_name)

def generate_recent_memcache(data_length):
    q=Words_content.all().ancestor(contents_key(DEFAULT_CONTENT_NAME));
    q.order("-time");
    data=q.fetch(data_length)
    if (len(data)<data_length):
        data_length=len(data);
    str_buf = "";
    for i in range(0, data_length):
        str_buf=str_buf+data[i].content;
        if (i<data_length-1):
            str_buf=str_buf+'\n';
    memcache.set('recent_content', str_buf);
    return data_length;

def fetch_data_news(data_length):
    url = "http://news.google.com/?output=rss&num="+str(data_length*2);
    result = urlfetch.fetch(url);
    if result.status_code == 200:
        root = etree.fromstring(result.content);
        str_buf = "";
        count=0;
        for item in root.findall('./channel/item/title'):
            title=item.text;
            pos=title.find("-");
            if (pos>=0) :
                title = title[:pos];
            title=title.strip();
            if (len(title)<40): #skip short title
                continue;
            str_buf=str_buf+title+'\n';
            count=count+1;
            if (count>=16):
                break;
        str_buf=str_buf.strip();
        memcache.set('recent_content',str_buf);
        return str_buf;
    return None;

def base64_modify_back(base64data):
    base64data = base64data.replace('-', '+').replace('_', '/');
    padding_len =(4 - (len(base64data) % 4)) % 4 ;
    base64data = base64data+('='*padding_len);
    return base64data;

class Words_content(db.Model):
    time = db. DateTimeProperty(auto_now=True);
    content = db.StringProperty();

class Poems_content(db.Model):
    time = db. DateTimeProperty(auto_now=True);
    content = db.StringProperty();
    comment = db.StringProperty();
    poster = db.BlobProperty();

class Recent_data(webapp2.RequestHandler):
    def get(self):
        all_data_number=16;
        #get most recent item
        memcache_recent=memcache.get('recent_content');
        if memcache_recent is None:
            fetch_data_news(all_data_number);
            memcache_recent=memcache.get('recent_content');
            #logging.info('fetch again')
        
        data = memcache_recent.split("\n");
        
        self.response.headers['Content-Type'] = 'text/plain';
        for x in range(0, all_data_number):
            if (x<len(data)):
                content=data[x];
            else:
                content="Lorem ipsum dolor sit amet, consectetur adipisicing elit. ";
            self.response.write(content);
            self.response.write("\n");

class Recent_Poems(webapp2.RequestHandler):	#TODO: add cache
    def get(self):
        all_data_number=10;
        #get most recent item     
        q=Poems_content.all().ancestor(contents_key(POEM_CONTENT_NAME));
        q.order("-time");
        data=q.fetch(all_data_number)
        self.response.headers['Content-Type'] = 'text/plain';
        for i in range(0, len(data)):
            self.response.write(data[i].comment + "\t" + data[i].content);
            self.response.write("\n");
     

class Submit_data(webapp2.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/plain';
        content = self.request.get('content');
        if (re.match("^[\,\.\?\!\;\' A-Za-z0-9_-]*$", content)):
            str_len=len(content);
            if (str_len>=60 and str_len<=200):
                self.response.write("OK.")
                ct = Words_content(parent=contents_key(DEFAULT_CONTENT_NAME));	#put into database
                ct.content = content;
                ct.put();
                generate_recent_memcache(16);
            else:
                self.response.write("Your " + str(str_len) + " characters context isn't between 60 to 200 characters")
        else:
            self.response.write("Special characters are not allowed");
            
class New_Poem(webapp2.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/plain';
        poem = self.request.get('poem');
        if (re.match("^[\,\.\?\!\;\' A-Za-z0-9_-]*$", poem)):
            comment = self.request.get('comment');
            if (comment=="G"):
                comment="GOOD";
            if (comment=="B"):
                comment="BAD";
            self.response.write("A "+comment+" poem is:"+poem);
            ct = Poems_content(parent=contents_key(POEM_CONTENT_NAME));	#put into database
            ct.content = poem;
            ct.comment = comment;
            ct.put()
        else:
            self.response.write("Special characters are not allowed");

class Fetch_data(webapp2.RequestHandler):   
    def get(self):
        self.response.headers['Content-Type'] = 'text/plain';
        self.response.write("FETCH\n");
        res=fetch_data_news(16);
        if (res!=None):
            self.response.write(res);
        else:
            self.response.write("FAIL");

class Upload_poster(webapp2.RequestHandler):
    def post(self):
        self.response.headers['Content-Type'] = 'text/plain';
        self.response.write("Upload OK\n");
        poem = (self.request.get('poem'));
        poem=base64_modify_back(poem);
        poem = base64.b64decode(poem);
        imgData = self.request.get('imgData');
        imgData=base64_modify_back(imgData);
        self.response.write(poem+'\n');
        self.response.write(len(imgData));

        #only keep recent 10        
        q=Poems_content.all().ancestor(contents_key(POEM_CONTENT_NAME));
        q.order("-time");
        all_data_number=10;
        data=q.fetch(all_data_number*2);
        if (len(data)>=all_data_number):
            for i in range(all_data_number-1, len(data)):
                db.delete(data[i]);
 
        ct = Poems_content(parent=contents_key(POEM_CONTENT_NAME));	#put into database
        ct.content = poem;
        ct.poster = db.Blob(base64.b64decode(imgData));    
        ct.put();
        
class Get_poster(webapp2.RequestHandler):
     def get(self):
        all_data_number=10;
        #get most recent item     
        q=Poems_content.all().ancestor(contents_key(POEM_CONTENT_NAME));
        q.order("-time");
        data=q.fetch(all_data_number)
        if data[0].poster:
            self.response.headers['Content-Type'] = 'image/jpeg'
            self.response.out.write(data[0].poster)
        else:
            self.error(404)

application = webapp2.WSGIApplication([
    ('/submit', Submit_data),
    ('/recent', Recent_data),
    ('/new_poem', New_Poem),
    ('/recent_poems', Recent_Poems),
    ('/fetch_data', Fetch_data),
    ('/upload_poster', Upload_poster),
    ('/get_poster', Get_poster),
], debug=True)
