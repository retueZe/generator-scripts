import { Option } from 'async-option'
import { AsyncResult } from 'async-option/async'

export type GeneratorScriptInterpreter<I, O> = (input: I, callback: (output: O) => void) => Option<O>

export interface IGeneratorScriptInvoker<I, O> {
    invoke<R>(script: Generator<I, R, O>): Promise<R>
    safeInvoke<R, E = unknown>(script: Generator<I, R, O>): AsyncResult<R, E>
}
