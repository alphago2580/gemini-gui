// __mocks__/node-pty.js
const { EventEmitter } = require('events');

class MockPty extends EventEmitter {
    constructor() {
        super();
        this.pid = 12345;
    }

    resize() { }
    write(data) { }
    kill() { }
}

const spawn = jest.fn(() => new MockPty());

module.exports = {
    spawn
};
