import { detectCodeLanguage } from './detectCodeLanguage';

describe('detectCodeLanguage', () => {
  describe('TypeScript detection', () => {
    it('detects TypeScript interface', () => {
      const code = `interface User {
  name: string;
  age: number;
}`;
      expect(detectCodeLanguage(code)).toBe('typescript');
    });

    it('detects TypeScript type alias', () => {
      const code = `type Status = 'active' | 'inactive';
const x: Status = 'active';`;
      expect(detectCodeLanguage(code)).toBe('typescript');
    });

    it('detects TypeScript enum', () => {
      const code = `export enum Direction {
  Up = 'UP',
  Down = 'DOWN',
}`;
      expect(detectCodeLanguage(code)).toBe('typescript');
    });

    it('detects TypeScript with generics', () => {
      const code = `function identity<T>(arg: T): T {
  return arg;
}`;
      expect(detectCodeLanguage(code)).toBe('typescript');
    });
  });

  describe('JavaScript detection', () => {
    it('detects CommonJS module', () => {
      const code = `const fs = require('fs');
module.exports = { readFile };`;
      expect(detectCodeLanguage(code)).toBe('javascript');
    });

    it('detects console.log usage', () => {
      const code = `const greeting = 'hello';
console.log(greeting);
console.error('oops');`;
      expect(detectCodeLanguage(code)).toBe('javascript');
    });

    it('detects DOM manipulation', () => {
      const code = `const el = document.getElementById('app');
const btn = document.querySelector('.btn');`;
      expect(detectCodeLanguage(code)).toBe('javascript');
    });
  });

  describe('Python detection', () => {
    it('detects Python function definition', () => {
      const code = `def hello(name):
    print(f"Hello, {name}")

if __name__ == "__main__":
    hello("world")`;
      expect(detectCodeLanguage(code)).toBe('python');
    });

    it('detects Python class', () => {
      const code = `class Animal:
    def __init__(self):
        self.name = None

    def speak(self):
        return None`;
      expect(detectCodeLanguage(code)).toBe('python');
    });

    it('detects Python imports', () => {
      const code = `import os
from pathlib import Path
from typing import List

def process(items: List[str]):
    pass`;
      expect(detectCodeLanguage(code)).toBe('python');
    });
  });

  describe('Java detection', () => {
    it('detects Java class', () => {
      const code = `public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`;
      expect(detectCodeLanguage(code)).toBe('java');
    });

    it('detects Java imports and annotations', () => {
      const code = `import java.util.List;

public class Service {
    @Override
    private final String name;
}`;
      expect(detectCodeLanguage(code)).toBe('java');
    });
  });

  describe('Rust detection', () => {
    it('detects Rust function', () => {
      const code = `fn main() {
    let mut x = 5;
    println!("Value: {}", x);
    x = 10;
}`;
      expect(detectCodeLanguage(code)).toBe('rust');
    });

    it('detects Rust struct and impl', () => {
      const code = `pub struct Point {
    x: f64,
    y: f64,
}

impl Point {
    pub fn new(x: f64, y: f64) -> Point {
        Point { x, y }
    }
}`;
      expect(detectCodeLanguage(code)).toBe('rust');
    });
  });

  describe('Go detection', () => {
    it('detects Go package and function', () => {
      const code = `package main

import (
    "fmt"
)

func main() {
    name := "world"
    fmt.Println("Hello", name)
}`;
      expect(detectCodeLanguage(code)).toBe('go');
    });
  });

  describe('HTML detection', () => {
    it('detects HTML document', () => {
      const code = `<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
</head>
<body>
  <div class="container">Hello</div>
</body>
</html>`;
      expect(detectCodeLanguage(code)).toBe('html');
    });
  });

  describe('CSS detection', () => {
    it('detects CSS rules', () => {
      const code = `.container {
  display: flex;
  background-color: #fff;
  margin: 10px;
  padding: 20px;
}

@media (max-width: 768px) {
  .container {
    display: block;
  }
}`;
      expect(detectCodeLanguage(code)).toBe('css');
    });
  });

  describe('JSON detection', () => {
    it('detects JSON object', () => {
      const code = `{
  "name": "test-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.0.0"
  }
}`;
      expect(detectCodeLanguage(code)).toBe('json');
    });

    it('detects JSON array', () => {
      const code = `[
  { "id": 1, "name": "Alice" },
  { "id": 2, "name": "Bob" }
]`;
      expect(detectCodeLanguage(code)).toBe('json');
    });
  });

  describe('Bash detection', () => {
    it('detects bash script with shebang', () => {
      const code = `#!/bin/bash
echo "Starting deployment"
export NODE_ENV=production
if [ -f "package.json" ]; then
  npm install
fi`;
      expect(detectCodeLanguage(code)).toBe('bash');
    });

    it('detects bash conditionals', () => {
      const code = `if [ "$1" = "test" ]; then
  echo "Running tests"
  npm test
fi`;
      expect(detectCodeLanguage(code)).toBe('bash');
    });
  });

  describe('SQL detection', () => {
    it('detects SQL query', () => {
      const code = `SELECT u.name, u.email
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.status = 'active'
ORDER BY u.name
LIMIT 10;`;
      expect(detectCodeLanguage(code)).toBe('sql');
    });

    it('detects CREATE TABLE', () => {
      const code = `CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255)
);

INSERT INTO users (name, email) VALUES ('Alice', 'alice@example.com');`;
      expect(detectCodeLanguage(code)).toBe('sql');
    });
  });

  describe('YAML detection', () => {
    it('detects YAML config', () => {
      const code = `name: my-app
version: 1.0
services:
  web:
    image: nginx
    ports:
      - 80:80`;
      expect(detectCodeLanguage(code)).toBe('yaml');
    });
  });

  describe('edge cases', () => {
    it('returns empty string for empty input', () => {
      expect(detectCodeLanguage('')).toBe('');
    });

    it('returns empty string for whitespace-only input', () => {
      expect(detectCodeLanguage('   \n  \t  ')).toBe('');
    });

    it('returns empty string for ambiguous short snippet', () => {
      expect(detectCodeLanguage('x = 5')).toBe('');
    });

    it('respects custom minScore threshold', () => {
      const code = `echo "hello"`;
      // With very high threshold, should not detect
      expect(detectCodeLanguage(code, 100)).toBe('');
    });

    it('detects with lower minScore threshold', () => {
      const code = `echo "hello"`;
      // With low threshold, should detect bash
      expect(detectCodeLanguage(code, 1)).toBe('bash');
    });

    it('prefers TypeScript over JavaScript when TS patterns match', () => {
      const code = `const x: string = 'hello';
function greet(name: string): void {
  console.log(name);
}`;
      expect(detectCodeLanguage(code)).toBe('typescript');
    });
  });
});
