#!/bin/bash
cd /home/kavia/workspace/code-generation/kollywood-quizmaster-38829-639dbda0/kollywood_quizmaster
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

