"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
//schema
const Schema = mongoose.Schema;
const formSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    number: { type: Number, required: true },
    password: { type: String, required: true },
});
formSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(9));
};
formSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};
//model
const Form = mongoose.model('form', formSchema);
module.exports = Form;
//# sourceMappingURL=form.js.map