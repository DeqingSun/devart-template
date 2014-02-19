import webapp2
import re

from google.appengine.api import memcache
from google.appengine.ext import ndb
from google.appengine.ext import db
import logging

DEFAULT_CONTENT_NAME = 'default_CONTENT'
def contents_key(contents_name=DEFAULT_CONTENT_NAME):
    """Constructs a Datastore key for a Contents entity with contents_name."""
    return db.Key.from_path('Plinko_contents', contents_name)

class Words_content(db.Model):
    time = db. DateTimeProperty(auto_now=True);
    content = db.StringProperty();

class Recent_data(webapp2.RequestHandler):	#TODO: add cache
    def get(self):
        all_data_number=16;
        #get most recent item
        q=Words_content.all().ancestor(contents_key(DEFAULT_CONTENT_NAME));
        q.order("-time");
        data=q.fetch(all_data_number)
        self.response.headers['Content-Type'] = 'text/plain';
        for x in range(0, all_data_number):
            if (x<len(data)):
                content=data[x].content;
            else:
                content="Lorem ipsum dolor sit amet, consectetur adipisicing elit. ";
            self.response.write(content);
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
                ct.put()				
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
        else:
            self.response.write("Special characters are not allowed");


application = webapp2.WSGIApplication([
    ('/submit', Submit_data),
    ('/recent', Recent_data),
    ('/new_poem', New_Poem),
], debug=True)
