#MIT License

#Copyright (c) 2019 Paul Harwood

#Permission is hereby granted, free of charge, to any person obtaining a copy
#of this software and associated documentation files (the "Software"), to deal
#in the Software without restriction, including without limitation the rights
#to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
#copies of the Software, and to permit persons to whom the Software is
#furnished to do so, subject to the following conditions:

#The above copyright notice and this permission notice shall be included in all
#copies or substantial portions of the Software.

#THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
#IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
#FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
#AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
#LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
#OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
#SOFTWARE.

from google.cloud import storage
from PIL import Image
import io


class ndbImage(object): 
    
    content_type = "image/jpeg"
    content_format = "JPEG"
    
    def __init__(self, full_path, bucket_name):
        self.client = storage.Client()
        self.bucket = self.client.get_bucket(bucket_name)
        self.full_path = full_path
        
    def get(self):
        self.blob = self.bucket.get_blob(self.full_path)
        self.content_type = self.blob.content_type
        buffer = io.BytesIO(self.blob.download_as_string())
        buffer.seek(0)
        self.image = Image.open(buffer)
        
    def put(self, content_type=None, content_format=None):
        if (content_format == None and self.content_format == None) or (content_type == None and self.content_type == None):
            raise ValueError("ndbImage must have content_type and format for a put")
        if content_format :
            self.content_format = content_format
        if content_type:
            self.content_type = content_type
        if not hasattr(self, 'image'):
            raise ValueError("no Image to put")
        buffer = io.BytesIO()
        self.image.save(buffer, self.content_format)
        blob = getattr(self, 'blob', self.bucket.blob(self.full_path))
        blob.upload_from_file(file_obj=buffer, content_type=self.content_type, rewind=True)
        self.blob = blob
        
    def resize(self, size, target_path, bucket=None):
        if not hasattr(self, 'image'):
            raise ValueError("No Image to resize")
        if not bucket:
            bucket = self.bucket
        resize = ndbImage(target_path, bucket.name)
        resize.content_format = self.content_format
        resize.content_type = self.content_type
        resize.image = self.image.resize(size)
        return resize
