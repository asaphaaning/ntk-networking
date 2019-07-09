import NTKClient from './client';
import { USERNAME, PASSWORD } from './config.json';

const client = new NTKClient(USERNAME, PASSWORD);

client.init();
