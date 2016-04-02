#!/usr/bin/python

# Usage: python questions_format.py <list of files to parse>
# Output: An array of [category, question, answer, regexp] quartets,
# which can be easily pasted into the JavaScript console or similar.

import sys
import re

if len(sys.argv) == 1:
  print 'Error: must supply an input file to read from.'

f = sys.argv[1:]
questions = [ ]

build = [ None, None, None, None ]
building_question = False
parsed_regex = False
simple_regex = re.compile(r'^\w*: *(.*)$')

def get_content(line):
  return simple_regex.match(line).group(1)

def answer_to_regex(line):
  if '#' in line:
    start = line.find('#')
    end = line.find('#', start+1);
    return '(%s|%s)' % (line.replace('#', ''), line[start+1:end])
  return line

for fi in f:
  with open(fi, 'r') as f:
    for raw_line in f:
      line = raw_line.strip()
      if len(line) == 0 or line[0] == '#':
        if building_question:
          building_question = False
          parsed_regex = False
          questions += [build]
          build = [ None, None, None, None ]
        continue
      elif line.startswith("Category"):
        building_question = True
      if building_question:
        content = get_content(line)
        if line.startswith("Category"):
          build[0] = content
        elif line.startswith("Question"):
          build[1] = content
        elif line.startswith("Answer"):
          build[2] = content
          if not parsed_regex:
            build[3] = answer_to_regex(content)
        elif line.startswith("Regex"):
          parsed_regex = True
          build[3] = content

print '[' + ',\n'.join([str(k) for k in questions]) + ']'
