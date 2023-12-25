#!/usr/bin/env node

'use strict';

// Provide a title to the process in `ps`.
// Due to an obscure Mac bug, do not start this title with any symbol.
try {
  process.title = 'dedup ' + Array.from(process.argv).slice(2).join(' ');
} catch (_) {
  // If an error happened above, use the most basic title.
  process.title = 'dedup';
}
require('../cli');
