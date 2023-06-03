#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TodoInfraStack } from '../lib/todo-infra-stack';

const app = new cdk.App();
new TodoInfraStack(app, 'TodoInfraStack', {
 
});