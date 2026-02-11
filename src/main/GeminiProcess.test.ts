import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiProcess } from './GeminiProcess';

import { EventEmitter } from 'events';

// Mock node-pty
const mockPtyProcess = Object.assign(new EventEmitter(), {
  write: vi.fn(),
  kill: vi.fn(),
  resize: vi.fn(),
});

const mockSpawn = vi.fn((..._args: unknown[]) => mockPtyProcess);

// Important: Return the mock object directly, do NOT use actual factory
vi.mock('node-pty', () => {
    return {
        spawn: mockSpawn
    };
});

describe('GeminiProcess', () => {
    let gemini: GeminiProcess;

    beforeEach(() => {
        vi.clearAllMocks();
        // Inject the mock module that returns our mock spawn
        gemini = new GeminiProcess({ spawn: mockSpawn });
    });

    it('spawns pty process correctly', () => {
        gemini.start('dummy/path', '/tmp');

        expect(mockSpawn).toHaveBeenCalledWith(
            'node',
            expect.arrayContaining(['dummy/path', '--output-format', 'stream-json']),
            expect.objectContaining({ cwd: '/tmp' })
        );
    });

    it('parses incoming json data', () => {
        gemini.start('dummy/path', '/tmp');

        // Access the mock instance returned by spawn
        const mockPtyProcess = mockSpawn.mock.results[0].value;

        const listener = vi.fn();
        gemini.on('json', listener);

        // Simulate incoming data by emitting on the mock process
        const mockJson = { type: 'message', content: 'hello' };
        mockPtyProcess.emit('data', JSON.stringify(mockJson) + '\n');

        expect(listener).toHaveBeenCalledWith(mockJson);
    });

    it('handles fragmented data chunks', () => {
        gemini.start('dummy/path', '/tmp');
        const mockPtyProcess = mockSpawn.mock.results[0].value;

        const listener = vi.fn();
        gemini.on('json', listener);

        // Split valid JSON into two chunks
        const fullJson = '{"type":"fragment"}\n';
        mockPtyProcess.emit('data', fullJson.substring(0, 5));
        mockPtyProcess.emit('data', fullJson.substring(5));

        expect(listener).toHaveBeenCalledWith({ type: 'fragment' });
    });

    it('sends data to process', () => {
        gemini.start('dummy/path', '/tmp');
        const mockPtyProcess = mockSpawn.mock.results[0].value;

        // Spy on write
        const writeSpy = vi.spyOn(mockPtyProcess, 'write');

        gemini.send('hello');
        // Expect \r appended for terminal enter
        expect(writeSpy).toHaveBeenCalledWith('hello\r');
    });

    it('passes --model flag when model is specified', () => {
        gemini.start('dummy/path', '/tmp', process.env, undefined, 'gemini-2.5-pro');

        expect(mockSpawn).toHaveBeenCalledWith(
            'node',
            expect.arrayContaining(['--model', 'gemini-2.5-pro']),
            expect.objectContaining({ cwd: '/tmp' })
        );
    });

    it('does not pass --model flag when model is auto', () => {
        gemini.start('dummy/path', '/tmp', process.env, undefined, 'auto');

        const args = mockSpawn.mock.calls[0][1] as string[];
        expect(args).not.toContain('--model');
    });

    it('does not pass --model flag when model is undefined', () => {
        gemini.start('dummy/path', '/tmp');

        const args = mockSpawn.mock.calls[0][1] as string[];
        expect(args).not.toContain('--model');
    });

    it('passes both --system-instruction and --model when both are set', () => {
        gemini.start('dummy/path', '/tmp', process.env, 'Be helpful', 'gemini-2.5-flash');

        expect(mockSpawn).toHaveBeenCalledWith(
            'node',
            expect.arrayContaining([
                '--system-instruction', 'Be helpful',
                '--model', 'gemini-2.5-flash'
            ]),
            expect.objectContaining({ cwd: '/tmp' })
        );
    });

    it('does not start a second process if already running', () => {
        gemini.start('dummy/path', '/tmp');
        gemini.start('dummy/path', '/tmp');
        expect(mockSpawn).toHaveBeenCalledTimes(1);
    });

    it('throws when sending without starting', () => {
        expect(() => gemini.send('hello')).toThrow('Process not started');
    });

    it('stop kills and nullifies the process', () => {
        gemini.start('dummy/path', '/tmp');
        const proc = mockSpawn.mock.results[0].value;
        gemini.stop();
        expect(proc.kill).toHaveBeenCalled();
        // After stop, sending should throw
        expect(() => gemini.send('hello')).toThrow('Process not started');
    });

    it('stop is safe to call when no process is running', () => {
        expect(() => gemini.stop()).not.toThrow();
    });

    it('emits exit event and nullifies process on pty exit', () => {
        gemini.start('dummy/path', '/tmp');
        const proc = mockSpawn.mock.results[0].value;
        const exitListener = vi.fn();
        gemini.on('exit', exitListener);
        proc.emit('exit', 0);
        expect(exitListener).toHaveBeenCalledWith(0);
        // After exit, process should be null → send throws
        expect(() => gemini.send('test')).toThrow('Process not started');
    });

    it('ignores non-JSON lines in data stream', () => {
        gemini.start('dummy/path', '/tmp');
        const proc = mockSpawn.mock.results[0].value;
        const jsonListener = vi.fn();
        gemini.on('json', jsonListener);
        proc.emit('data', 'some plain text output\n');
        expect(jsonListener).not.toHaveBeenCalled();
    });

    it('ignores empty lines in data stream', () => {
        gemini.start('dummy/path', '/tmp');
        const proc = mockSpawn.mock.results[0].value;
        const jsonListener = vi.fn();
        gemini.on('json', jsonListener);
        proc.emit('data', '\n\n\n');
        expect(jsonListener).not.toHaveBeenCalled();
    });

    it('handles \\r\\n line endings', () => {
        gemini.start('dummy/path', '/tmp');
        const proc = mockSpawn.mock.results[0].value;
        const jsonListener = vi.fn();
        gemini.on('json', jsonListener);
        proc.emit('data', '{"type":"crlf"}\r\n');
        expect(jsonListener).toHaveBeenCalledWith({ type: 'crlf' });
    });

    it('silently ignores malformed JSON lines', () => {
        gemini.start('dummy/path', '/tmp');
        const proc = mockSpawn.mock.results[0].value;
        const jsonListener = vi.fn();
        gemini.on('json', jsonListener);
        proc.emit('data', '{invalid json}\n');
        expect(jsonListener).not.toHaveBeenCalled();
    });

    it('passes --system-instruction flag when systemPrompt is provided', () => {
        gemini.start('dummy/path', '/tmp', process.env, 'You are a helper');
        const args = mockSpawn.mock.calls[0][1] as string[];
        const idx = args.indexOf('--system-instruction');
        expect(idx).toBeGreaterThan(-1);
        expect(args[idx + 1]).toBe('You are a helper');
    });

    it('does not pass --system-instruction when systemPrompt is undefined', () => {
        gemini.start('dummy/path', '/tmp');
        const args = mockSpawn.mock.calls[0][1] as string[];
        expect(args).not.toContain('--system-instruction');
    });

    it('always passes --yolo flag', () => {
        gemini.start('dummy/path', '/tmp');
        const args = mockSpawn.mock.calls[0][1] as string[];
        expect(args).toContain('--yolo');
    });

    it('always passes --output-format stream-json', () => {
        gemini.start('dummy/path', '/tmp');
        const args = mockSpawn.mock.calls[0][1] as string[];
        const idx = args.indexOf('--output-format');
        expect(idx).toBeGreaterThan(-1);
        expect(args[idx + 1]).toBe('stream-json');
    });

    it('handles multiple JSON objects in single data chunk', () => {
        gemini.start('dummy/path', '/tmp');
        const proc = mockSpawn.mock.results[0].value;
        const listener = vi.fn();
        gemini.on('json', listener);
        proc.emit('data', '{"type":"a"}\n{"type":"b"}\n');
        expect(listener).toHaveBeenCalledTimes(2);
        expect(listener).toHaveBeenCalledWith({ type: 'a' });
        expect(listener).toHaveBeenCalledWith({ type: 'b' });
    });

    it('uses node as executable', () => {
        gemini.start('dummy/path', '/tmp');
        expect(mockSpawn).toHaveBeenCalledWith(
            'node',
            expect.any(Array),
            expect.any(Object)
        );
    });

    it('passes cwd to pty spawn options', () => {
        gemini.start('dummy/path', '/home/user');
        expect(mockSpawn).toHaveBeenCalledWith(
            expect.any(String),
            expect.any(Array),
            expect.objectContaining({ cwd: '/home/user' })
        );
    });

    it('can restart after stop', () => {
        gemini.start('dummy/path', '/tmp');
        gemini.stop();
        gemini.start('dummy/path', '/tmp');
        expect(mockSpawn).toHaveBeenCalledTimes(2);
    });

    it('ignores lines that start with { but do not end with }', () => {
        gemini.start('dummy/path', '/tmp');
        const proc = mockSpawn.mock.results[0].value;
        const listener = vi.fn();
        gemini.on('json', listener);
        proc.emit('data', '{partial data without closing\n');
        expect(listener).not.toHaveBeenCalled();
    });

    it('buffer accumulates partial JSON until newline arrives', () => {
        gemini.start('dummy/path', '/tmp');
        const proc = mockSpawn.mock.results[0].value;
        const listener = vi.fn();
        gemini.on('json', listener);
        proc.emit('data', '{"type":');
        expect(listener).not.toHaveBeenCalled();
        proc.emit('data', '"buffered"}\n');
        expect(listener).toHaveBeenCalledWith({ type: 'buffered' });
    });
});
