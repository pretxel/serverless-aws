# Serverless F1

A Serverless starter that adds drivers to Airtable. 
Part of the [Serverless Stack](http://serverless-stack.com) guide.

### Requirements

- [Install the Serverless Framework](https://serverless.com/framework/docs/providers/aws/guide/installation/)
- [Configure your AWS CLI](https://serverless.com/framework/docs/providers/aws/guide/credentials/)

### Installation

Enter the new directory

``` bash
$ cd serverless-aws
```

Install the Node.js packages

``` bash
$ npm install
```

### Usage

To run a function on your local

``` bash
$ serverless invoke local --function f1
```

Deploy your project

``` bash
$ serverless deploy --stage dev
```
