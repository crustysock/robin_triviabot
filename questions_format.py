#!/usr/bin/python

# Usage: python questions_format.py <list of files to parse>
# Output: An array of [category, question, answer] triplets,
# which can be easily pasted into the JavaScript console or similar.

import sys
import re

if len(sys.argv) == 1:
  print 'Error: must supply an input file to read from.'

f = sys.argv[1:]
questions = [ ]

build = [ ]
building_question = False

simple_regex = re.compile(r'^\w*: *(.*)$')

for fi in f:
  with open(fi, 'r') as f:
    for raw_line in f:
      line = raw_line.strip()
      if len(line) == 0 or line[0] == '#':
        if building_question:
          building_question = False
          questions += [build]
          build = [ ]
        continue
      elif line.startswith("Category"):
        building_question = True
      if building_question:
        build += [simple_regex.match(line).group(1)]

print ',\n'.join([str(k) for k in questions])
