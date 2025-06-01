// 400.0
function validatePassword(password) {
    return typeof password === 'string' &&
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$%*#?&!^])[A-Za-z\d@$%*#?&!^]{8,}$/.test(password);
}

// 400.1
function validateUsername(username) {
    return typeof username === 'string' && username.trim().length > 0;
}

// 400.2
function validateFirstName(fname) {
    return typeof fname === 'string' && /^[A-Z][a-z]*$/.test(fname);
}

// 400.3
function validateLastName(lname) {
    return typeof lname === 'string' && /^[A-Z][a-z]*$/.test(lname);
}

// 400.4
function validateEmail(email) {
    return typeof email === 'string' && /^[^@]+@[^@]+\.[^@]+$/.test(email);
}

// 400.5
function passwordsMatch(password, confirmPassword) {
    return password === confirmPassword;
}

// 400.6
function validateUserType(userType) {
    return typeof userType === 'string' && userType.trim() !== '';
}

module.exports = {
    validateUsername,
    validateFirstName,
    validateLastName,
    validateEmail,
    validatePassword,
    passwordsMatch,
    validateUserType
};
