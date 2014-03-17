import webapp2
import re

from google.appengine.api import memcache, channel, images
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

def broadcast(message, count):
    for id in range(count):
        channel.send_message(str(id), message)

class Poems_content(db.Model):
    time = db. DateTimeProperty(auto_now=True);
    content = db.StringProperty();
    comment = db.StringProperty();
    poster = db.BlobProperty();
    poster_90 = db.BlobProperty();

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
        img_bin = base64.b64decode(imgData);
        ct.poster = db.Blob(img_bin);
        #img = images.Image(image_data=img_bin);
        #img.rotate(-90);
        #ct.poster_90 = db.Blob(img.execute_transforms(output_encoding=images.JPEG));
        ct.put();
        
        screens_count=3;
        resp="A new Poster!!\n";
        q=Poems_content.all().ancestor(contents_key(POEM_CONTENT_NAME));
        q.order("-time");
        datas=q.fetch(screens_count);
        for data in datas:
            resp=resp+str(data.key())+"\n";
        broadcast(resp,screens_count);
        
class Get_poster(webapp2.RequestHandler):
     def get(self):  
        data = db.get(self.request.get('img_key'))
        rotate_90 = self.request.get('rot');
        if data.poster:
            self.response.headers.add_header("Access-Control-Allow-Origin", "*")
            self.response.headers['Content-Type'] = 'image/jpeg'
            if (rotate_90=="t"):
                self.response.out.write(data.poster_90)
            else:
                self.response.out.write(data.poster)
        else:
            self.error(404)

class Get_poster_key(webapp2.RequestHandler):
     def get(self):
        poster_id = int(self.request.get('id'));
        if (poster_id>=0 and poster_id <10):
            q=Poems_content.all().ancestor(contents_key(POEM_CONTENT_NAME));
            q.order("-time");
            data=q.fetch(10);
            self.response.headers['Content-Type'] = 'text/plain';
            self.response.write(data[poster_id].key());
        else :
            self.error(404)

class Gallery(webapp2.RequestHandler):
    def get(self):
        self.response.out.write("<html><head><title>Gallery</title></head><body>")
        q=Poems_content.all().ancestor(contents_key(POEM_CONTENT_NAME));
        q.order("-time");
        data=q.fetch(10)
        for i in range(0, len(data)):
            self.response.out.write('<img src="get_poster?img_key=%s" height="640"></img><br>' % data[i].key())
        self.response.out.write('Currently gallery only store 640*480 posters<br>');
        self.response.out.write("</body></html>")
        
class GetTokenHandler(webapp2.RequestHandler):
    def get(self):
        self.response.headers['Content-Type'] = 'text/plain';
        channel_id = self.request.get('id');
        try:
            channel_id=int(channel_id);
        except ValueError:
            self.response.out.write("ERR: INVALID TOKEN");
            return;

        if (channel_id>=0 and channel_id<=10):
            force_recreate = self.request.get('fr');
            tokens = memcache.get('tokens');
            try:
                token = tokens[channel_id];
            except (TypeError):
                token = None;   
            if (force_recreate=="t" or token==None):
                try:
                    token = channel.create_channel(str(channel_id),duration_minutes=24*60);
                    self.response.out.write(token);
                    if tokens is None:    
                        tokens=[None]*10;
                    tokens[channel_id]=token;
                    memcache.set('tokens', tokens); #store it
                except channel.InvalidChannelClientIdError:
                    self.response.out.write("ERR: TOKEN");
            else:
                self.response.out.write(token);
        else:
            self.response.out.write("ERR: INVALID ID RANGE");

application = webapp2.WSGIApplication([
    ('/recent', Recent_data),
    ('/fetch_data', Fetch_data),
    ('/upload_poster', Upload_poster),
    ('/get_poster', Get_poster),
    ('/get_poster_key', Get_poster_key),
    ('/gallery', Gallery),
    ('/get_token', GetTokenHandler),
], debug=True)
