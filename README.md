# `generator-scripts`

Wraps generators into I/O script functions.

## Examples

```javascript
import { NONE, Some } from 'async-option'
import { GeneratorScriptInvoker } from 'generator-scripts'

function wait(delay) {
    return {id: 'wait', delay}
}
function log(message) {
    return {id: 'log', message}
}
// `callback` may accept value, meaning that `yield`'s are expressions not
// statements, i.e. return values. If resulting option has value then the
// opration has performed synchronously, otherwise the `callback` should end
// the execution.
function interpreter(command, callback) {
    if (command.id === 'wait') {
        setTimeout(callback, command.delay)

        return NONE
    }

    console.log(command.message)

    return new Some()
}

function* script() {
    yield log('started')
    yield wait(3000)
    yield log('completed')

    return 'done'
}

const invoker = new GeneratorScriptInvoker(interpreter)
invoker.invoke(script()).then(console.log)
```

```javascript
import { Some } from 'async-option'
import { GeneratorScriptInvoker } from 'generator-scripts'

function interpreter(value) {
    return new Some(value * value)
}

function* script(value) {
    const squared = yield value

    if (squared > 10) throw 'some error'

    return squared
}

function test(value) {
    const invoker = new GeneratorScriptInvoker(interpreter)
    // returns `AsyncResult` values
    invoker.safeInvoke(script(value))
        .onSuccess(value => console.log('succeeded:', value))
        .onFailure(message => console.log('failed:', message))
}

test(2)
test(3)
test(4)

// Output:
// succeeded: 4
// succeeded: 9
// failed: some error
```
