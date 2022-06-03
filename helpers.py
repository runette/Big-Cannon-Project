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

def to_bool(bool_str) -> bool:
    """Parse the string and return the boolean value encoded or raise an exception"""
    if isinstance(bool_str, str) and bool_str:
        if bool_str.lower() in ['true', 't', '1', 'on']: return True
        elif bool_str.lower() in ['false', 'f', '0', 'off']: return False
        else: raise TypeError
    elif isinstance(bool_str, bool):
        return bool_str
    elif isinstance(bool_str, int) or isinstance(bool_str, float):
        if bool_str == 0:
            return False
        else:
            return True
    elif bool_str is None:
        return False
    else:
        raise TypeError("to_bool requires a str or bool, received :" + str(type(bool_str)))

def to_int(int_string) -> int:
    '''parse a string to an int but fail quietly'''
    try:
        return int(int_string)
    except Exception :
        return 0