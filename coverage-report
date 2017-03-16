#!/usr/bin/env bash
rm -rf coverage
rm -rf lib-cov

mkdir coverage

node_modules/.bin/jscover lib lib-cov
mv lib lib-orig
mv lib-cov lib
node_modules/.bin/mocha -R mocha-lcov-reporter > coverage/coverage.lcov
rm -rf lib
mv lib-orig lib
