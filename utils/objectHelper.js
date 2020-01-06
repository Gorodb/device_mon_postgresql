exports.clearUndefinedFields = (body) => Object.keys(body).forEach(key => {
    if (body[key] === undefined) delete body[key]
})
