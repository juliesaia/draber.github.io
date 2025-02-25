import _ from 'lodash';
import format from '../formatters/format.js';

const result = {}

/**
 *
 * @param unordered
 * @returns {{}}
 */
const sortObjByKey = unordered => {
    return Object.keys(unordered).sort().reduce(
        (ordered, key) => {
            ordered[key] = unordered[key];
            return ordered;
        }, {}
    );
}

/**
 * Ensure all rules are inside a scope (@media, @keyframes etc., defaults to @unscoped}
 * @param {String} rules
 * @returns {string|*}
 */
const normalizeRules = rules => {
    return !rules.startsWith('@') ? `@unscoped{${rules}}` : rules;
}

/**
 *
 * @param line
 * @param type
 * @returns {{}}
 */
const parse = (line, type) => {
    const contextData = normalizeRules(line).match(/^(?<context>@[^{]+){(?<rules>.*)}$/);

    const context = contextData.groups.context.trim();
    result[context] = result[context] || {};
    const rules = contextData.groups.rules.trim();
    const ruleMatches = rules.matchAll(/(?<selector>[^{]+){(?<values>[^}]+)}/g);
    for (let match of ruleMatches) {

        const selector = match.groups.selector.trim();
        let declarationBlock = match.groups.values.trim();
        const dataUriMatches = declarationBlock.match(/url\((data\:[^\)]+)\)/g) || [];
        dataUriMatches.forEach((match, index) => {
            declarationBlock = declarationBlock.replace(match, '_urlDataUri_' + index)
        });
        declarationBlock = declarationBlock.split(';')
            .map(entry => {
                const placeholderMatches = entry.matchAll(/(?<all>(?:_urlDataUri_)(?<cnt>\d+))/g)
                for (let placeholder of placeholderMatches) {
                    entry = entry.replace(
                        placeholder.groups.all,
                        dataUriMatches[parseInt(placeholder.groups.cnt)].replace(/:/, '_urlDataUriColon_')
                    )
                }
                return entry;
            }).filter(entry => entry);
        result[context][selector] = result[context][selector] || {};
        declarationBlock.forEach(declaration => {
            let [property, value] = declaration.split(':').map(entry => entry.replace(/_urlDataUriColon_/, ':'));
            property = _.camelCase(property);
            result[context][selector][property] = result[context][selector][property] || {
                ref: '__empty__',
                cur: '__empty__'
            };
            result[context][selector][property][type] = value;
            if (type === 'cur') {
                if (result[context][selector][property].ref === result[context][selector][property].cur) {
                    delete result[context][selector][property];
                }
            }
        })
        if (_.isEmpty(result[context][selector])) {
            delete result[context][selector];
        } else {
            result[context][selector] = sortObjByKey(result[context][selector]);
        }
    }

    return result;
}

/**
 *
 * @param ref
 * @param cur
 * @returns {Map<string, undefined>}
 */
const diff = (ref, cur) => {
    return new Map([
        ['ref', ref.map(entry => entry.trim()).filter(rule => !cur.includes(rule))],
        ['cur', cur.map(entry => entry.trim()).filter(rule => !ref.includes(rule))],
    ]);
}

/**
 * Test two stylesheets for equality
 * @param {Array} ref (CSS, one selector|@rule per line)
 * @param {Array} cur (CSS, one selector|@rule per line)
 * @returns {{msg: {}}|boolean}
 */
const cssEquality = (ref, cur) => {

    ref = format('css', ref, 'compact').split('\n').filter(entry => entry);
    cur = format('css', cur, 'compact').split('\n').filter(entry => entry);

    diff(ref, cur).forEach((rules, type) => {
        rules.map(line => parse(line, type));
    });

    return !_.isEmpty(result) ? {
        msg: result
    } : false;
}

export default cssEquality;