import { parse as babylonParse } from 'babylon'

export default function parse(source, options = {}) {
    return babylonParse(source).program.body
}
