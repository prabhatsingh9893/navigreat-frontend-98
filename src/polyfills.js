
import _ from 'lodash';
import * as Redux from 'redux';
import { Buffer } from 'buffer';

window.global = window;
window.process = { env: { NODE_ENV: 'development' }, browser: true };
window.Buffer = Buffer;
window._ = _;
window.Redux = Redux;
