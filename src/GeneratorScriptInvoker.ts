import { Failure, Success } from 'async-option'
import { AsyncResult } from 'async-option/async'
import { GeneratorScriptInterpreter, IGeneratorScriptInvoker } from './abstraction.js'

export class GeneratorScriptInvoker<I, O> implements IGeneratorScriptInvoker<I, O> {
    constructor(private readonly _interpreter: GeneratorScriptInterpreter<I, O>) {}

    invoke<R>(script: Generator<I, R, O>): Promise<R> {
        return new Promise((resolve, reject) => {
            this._interpret(script, resolve, reject)
        })
    }
    safeInvoke<R, E = unknown>(script: Generator<I, R, O>): AsyncResult<R, E> {
        return new AsyncResult(this.invoke(script).then(
            result => new Success(result),
            error => new Failure(error)
        ))
    }
    private _interpret<R>(
        script: Generator<I, R, O>,
        resolve: (result: R) => void,
        reject: (error: unknown) => void,
        firstIteration?: boolean | null,
        previousOutput?: O,
    ): void {
        firstIteration ??= true

        while (true) {
            let input: I

            try {
                const scriptResult = firstIteration
                    ? script.next()
                    : script.next(previousOutput!)

                if (scriptResult.done) {
                    resolve(scriptResult.value)

                    break
                }

                input = scriptResult.value
            } catch (e) {
                reject(e)

                break
            }

            const interpret = this._interpret<R>
            const callback = interpret.bind(this, script, resolve, reject, false)
            const interpreterResult = this._interpreter(input, callback)

            if (!interpreterResult.hasValue) break

            previousOutput = interpreterResult.value
            firstIteration = false
        }
    }
}
