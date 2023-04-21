/**
 * * Mong muốn đạt được / Output
 * -Khi dùng khai báo với cú pháp: Validator('selectorForm') => VD: Validator('#form-1');
 * -Có thể sử lý cơ bản tất cả các rules của input;
 * -Tối ưu độ thích nghi với nhiều form
 * -Đầu ra có thể là hành động mặc định của web đối với button trong form,
 * hoặc có thể trả về một objetc với đầy đủ thông tin người dùng nhập vào input.
 * 
 * 
 * 
 * * Các yêu cầu cơ bản về form khi áp dụng:
 * -Các input sẽ được gọi là một group 
 * -Trong form group yêu cầu có:
 *      + input(có name , id , rules) => Attribute của thẻ input,
 *        rules là để khai báo những quy tắc của input (VD: isRequired => Bắt buộc nhập, isEmail ,..),
 *        trong rules có thể chứa nhiều rule và giữa các rule ngăn cách = '|' (VD: rules="isRequired|isEmail").
 *      + Một thẻ có class formMessage(errorMessage => Mong muốn khi invalid) => Attribute,
 *        formMessage có tác dụng là để hiện thị cảnh báo khi invalid or valid.
 * 
 */

function Validator(formSelector) {

    //Tạo class khi nhập sai và đúng dữ liệu
    const invalidInputStyle = `
    .form-group.invalid input{
        background-color: #ff00001c;
        border: 2px solid #ff0000;
        transition: .3s;
    }

    .form-group.invalid input:focus,
    .form-group.invalid input:hover {
        background-color: transparent;
        border-color: #ff0000;
        box-shadow: inset 2px 2px 2px #ff00001c,
                    inset -2px -2px 2px #ff00001c;
    }

    .form-group.invalid .form-message {
        color: #ff0000;
    }
    `;

    const validInputStyle = `
    .form-group.valid input{
        background-color: #0dff921c;
        border: 2px solid #0dff92;
        transition: .3s;
    }

    .form-group.valid input:focus,
    .form-group.valid input:hover {
        background-color: transparent;
        border-color: #0dff92;
        box-shadow: inset 2px 2px 2px #0dff921c,
                    inset -2px -2px 2px #0dff921c;
    }

    .form-group.valid .form-message {
        color: #03a724;
    }`;

    // Tạo element <style> và thêm vào trong <head> của trang
    const styleElement = document.createElement('style');
    document.head.appendChild(styleElement);

    // Thêm các đoạn CSS vào element <style> vừa tạo
    styleElement.innerHTML = invalidInputStyle + validInputStyle;

    function invalidValue(formGroup) {
        if (formGroup.classList.contains('valid')) {
            formGroup.classList.remove('valid');
        }
        formGroup.classList.add('invalid');
    };

    function validValue(formGroup) {
        if (formGroup.classList.contains('invalid')) {
            formGroup.classList.remove('invalid');
        }
        formGroup.classList.add('valid');
    };

    const _This = this;

    let formRules = {};

    let validatorRules = {

        required : function (value , message) {
            return value.trim() ? undefined : message || 'Vui lòng nhập trường này!';
        },

        email: function(value , message) {
            const regexEmail = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i;
            return regexEmail.test(value) ? undefined : message || 'Vui lòng nhập email!';
        },

        password: function(value , message) {
            const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{0,}$/;
            return regexPassword.test(value) ? undefined : message || 'Mật khẩu bao gồm chữ in hoa , số  , ký tự!';
        },

        min: function(min) {
            return function(value , message) {
                return value.length >= min ? undefined : message || `Vui lòng nhập ít nhất ${min} ký tự!`;
            }
        },

        max: function(max) {
            return function(value , message) {
                return value.length <= max ? undefined : message || `Vui lòng nhập tối đa ${max} ký tự!`;
            }
        },
    };

    // Lấy ra form element trong DOM theo 'formSelector'
    let formElement = document.querySelector(formSelector);

    // Chỉ thực hiện khi có formElement
    if (formElement) {
        // Lấy ra các rules của từng input 
        let inputs = formElement.querySelectorAll('[name][rules]');
        for (var input of inputs) {

            let rules = input.getAttribute('rules').split('|');
            for (var rule of rules) {
                
                let ruleFunc = validatorRules[rule];

                if (rule.includes(':')) {
                    let ruleInfo = rule.split(':');
                    rule = ruleInfo[0];

                    ruleFunc = validatorRules[rule](ruleInfo[1]);
                }

                if (Array.isArray(formRules[input.name])) {
                    formRules[input.name].push(ruleFunc);
                }else {
                    formRules[input.name] = [ruleFunc];
                }
            };

            // handle validate (blur , change ...)
            input.onblur = handleValidate;
            input.oninput = handleClearError;

            // Hàm thực hiện validate
            function handleValidate(event) {
                let rules = formRules[event.target.name];
                let errorMessage; 

                rules.some((rule , index) => {
                    switch (event.target.type) {
                        case 'radio':
                        case 'checkbox':
                            errorMessage = rules[index](
                                formElement.querySelector('#' + event.target.name + ':checked') ? 'true' : ''
                            );
                            break;
                        default:
                            errorMessage = rules[index](event.target.value);
                    };
                    return errorMessage;
                });

                // Thực hiện hiện thị errorMessage ra UI
                if (errorMessage) {
                    let formGroup = event.target.closest('.form-group');
                    let formMessage;
                    if (formGroup) {
                        formMessage = formGroup.querySelector('.form-message');
                    };
    
                    if (formMessage) {
                        if (errorMessage) {
                            if (formMessage.getAttribute('message')) {
                                formMessage.innerText = formMessage.getAttribute('message');
                            }
                            formMessage.innerText = errorMessage;
                            invalidValue(formGroup);
                        } else {
                            formMessage.innerText = 'Hợp lệ!';
                            validValue(formGroup);
                        };
                    };
                };

                return !errorMessage;
            };

            // Hàm clear error message
            function handleClearError(event) {

                let formGroup = event.target.closest('.form-group');
                let formMessage;
                if (formGroup) {
                    formMessage = formGroup.querySelector('.form-message');
                };
                formMessage.innerText = '';
                if (formGroup) {
                    if (formGroup.matches('invalid')) {
                        formGroup.classList.remove('invalid');
                    }
                    if (formGroup.matches('valid')) {
                        formGroup.classList.remove('valid');
                    }

                };

            };

        };
    
    };

    // Xử lý hành vi submit của form
    formElement.onsubmit = function(event) {
        event.preventDefault();

        let inputs = formElement.querySelectorAll('[name][rules]');
        let isValid = true;
        for (var input of inputs) {
            if (!handleValidate({ target : input})) {
                isValid = false;
            };
        };

        if (isValid) {

            if (typeof _This.onSubmit === 'function') {

                let enableInputs = formElement.querySelectorAll('[name]');
                let formValues = Array.from(enableInputs).reduce(function(values , input){

                    switch (input.type) {
                        case 'radio':
                            values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                            break;
                        case 'checkbox':
                            if (typeof values[input.name] === 'undefined') {
                                values[input.name] = '';
                            }
                            if(!input.matches(':checked')) return values;
                            if(!Array.isArray(values[input.name])) {
                                values[input.name] = [];
                            }
                            values[input.name].push(input.value);
                            break;
                        case 'file':
                            values[input.name] = input.files;
                            break;
                        default: 
                            values[input.name] = input.value;
                    }
                    return values;
                }, {});

                _This.onSubmit(formValues);
            }else {
                formElement.submit();
            }

        };

    };

};