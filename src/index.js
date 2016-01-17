import parse from './parser'

const NUMB_OBJECT = 'N'

const UNARY_OPERATOR_FUNCS = {
    '+': 'unary+',
    '-': 'unary-',
    '~': '~',
}

export default function(babel) {
    const { types } = babel

    function isNumbObject(node) {
        return types.isIdentifier(node, { name: NUMB_OBJECT })
    }

    function templateSource(node) {
        const { quasi: { quasis } } = node
        if (quasis.length != 1) {
            throw new Error(`Numeric tag can't have interpolated expressions`)
        }
        return quasis[0].value.cooked
    }

    function numbMember(member) {
        return types.memberExpression(
            types.identifier(NUMB_OBJECT),
            types.stringLiteral(member),
            true
        )
    }

    function callNumb(member, args) {
        return types.callExpression(numbMember(member), args)
    }

    const transformOperators = {
        BinaryExpression(path) {
            const { left, right, operator } = path.node
            path.replaceWith(callNumb(operator, [left, right]))
        },

        UnaryExpression(path) {
            const { operator, argument } = path.node
            if (!(operator in UNARY_OPERATOR_FUNCS)) return

            const unaryFunc = UNARY_OPERATOR_FUNCS[operator]
            path.replaceWith(callNumb(unaryFunc, [argument]))
        },

        MemberExpression(path) {
            const { object, property, computed } = path.node
            if (!computed || isNumbObject(object)) return

            path.replaceWith(callNumb('[]', [object, property]))
        },

        AssignmentExpression(path) {
            const { operator, left, right } = path.node
            if (operator === '=') {
                if (types.isMemberExpression(left, { computed: true })) {
                    const { object, property } = left
                    path.replaceWith(callNumb('[]=', [
                        object, property, right
                    ]))
                }
            } else {
                path.replaceWith(callNumb(operator, [left, right]))
            }
        }
    }
    
    return {
        visitor: {
            TaggedTemplateExpression(path) {
                if (!isNumbObject(path.node.tag)) return

                const program = parse(templateSource(path.node))
                path.replaceExpressionWithStatements(program)
                path.parentPath.traverse(transformOperators)
            }
        }
    }
}
