
// Đối tượng validator
function validator(options) {

    let formElement = document.querySelector(options.form);

    //Tạo class khi nhập sai và đúng dữ liệu
    const invalidInputStyle = `
    ${options.formGroupSelector}.invalid input{
        background-color: #ff00001c;
        border: 2px solid #ff0000;
        transition: .3s;
    }

    ${options.formGroupSelector}.invalid input:focus,
    ${options.formGroupSelector}.invalid input:hover {
        background-color: transparent;
        border-color: #ff0000;
        box-shadow: inset 2px 2px 2px #ff00001c,
                    inset -2px -2px 2px #ff00001c;
    }

    ${options.formGroupSelector}.invalid ${options.errorSelector} {
        color: #ff0000;
    }
    `;

    const validInputStyle = `
    ${options.formGroupSelector}.valid input{
        background-color: #0dff921c;
        border: 2px solid #0dff92;
        transition: .3s;
    }

    ${options.formGroupSelector}.valid input:focus,
    ${options.formGroupSelector}.valid input:hover {
        background-color: transparent;
        border-color: #0dff92;
        box-shadow: inset 2px 2px 2px #0dff921c,
                    inset -2px -2px 2px #0dff921c;
    }

    ${options.formGroupSelector}.valid ${options.errorSelector} {
        color: #03a724;
    }
    `;

    // Tạo element <style> và thêm vào trong <head> của trang
    const styleElement = document.createElement('style');
    document.head.appendChild(styleElement);

    // Thêm các đoạn CSS vào element <style> vừa tạo
    styleElement.innerHTML = invalidInputStyle + validInputStyle;



    function getParent(element , selector) {
        while(element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    };

    let selectorRules = {};

    function Validate(inputElement , rule){
        let errorElement = getParent(inputElement , options.formGroupSelector).querySelector(options.errorSelector);
        let errorMessage;
        let rules = selectorRules[rule.selector];

        for (var i in rules) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked') ? 'true' : ''
                    );
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
            }
            if(errorMessage) break;
        };

        if(errorMessage) {
            errorElement.innerText = errorMessage;
            if(getParent(inputElement , options.formGroupSelector).classList.contains('valid')){
                getParent(inputElement , options.formGroupSelector).classList.remove('valid');
            };
            getParent(inputElement , options.formGroupSelector).classList.add('invalid');
        }else {
            errorElement.innerText = 'Hợp lệ!';
            getParent(inputElement , options.formGroupSelector).classList.remove('invalid');
            getParent(inputElement , options.formGroupSelector).classList.add('valid');
        }

        return !errorMessage;
    }

    

    if(formElement) {

        formElement.onsubmit = function(e) {
            e.preventDefault();

            let isFormValid = true;

            options.rules.forEach(rule => {
                let inputElements = formElement.querySelectorAll(rule.selector); 
                let isValid = true;
                Array.from(inputElements).forEach(inputElement => {
                    isValid = Validate(inputElement , rule);

                })
                if(!isValid) {
                    isFormValid = false;
                };
            });

            if(isFormValid){
                if(typeof options.onSubmit === 'function') {
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

                    options.onSubmit(formValues);     
                }else {
                    formElement.submit();
                }
            }
        }

        options.rules.forEach(rule => {
            
            let inputElements = formElement.querySelectorAll(rule.selector); 

            Array.from(inputElements).forEach(inputElement => {
                if (Array.isArray(selectorRules[rule.selector])) {
                    selectorRules[rule.selector].push(rule.test);
                }else {
                    selectorRules[rule.selector] = [rule.test];
                };    
    
                if(inputElement) {
                    //Xử lý trường hợp blur khỏi input
                    inputElement.onblur = function() {
                        Validate(inputElement , rule);
                    };
    
                    //Xử lý khi người dùng nhập vào input
                    inputElement.oninput = function() {
                        let errorElement = getParent(inputElement , options.formGroupSelector).querySelector(options.errorSelector);
                        errorElement.innerText = '';
                        if(getParent(inputElement , options.formGroupSelector).classList.contains('valid')){
                            getParent(inputElement , options.formGroupSelector).classList.remove('valid');
                        };
                        getParent(inputElement , options.formGroupSelector).classList.remove('invalid');
                    };
                }
            })

        });
    }
}


//Định nghĩa rules

validator.isRequired = function(selector , message) {
    return {
        selector: selector,
        test: function(value) {
            return value.trim() ? undefined : message || 'Vui lòng nhập trường này!';
        }
    };
}

validator.isEmail = function(selector , message) {
    return {
        selector: selector,
        test: function(value) {
            const regexEmail = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i;
            return regexEmail.test(value) ? undefined : message || 'Trường này phải là email!'
        }
    };
}

validator.isPassword = function(selector , message) {
    return {
        selector: selector,
        test: function(value) {
            const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}$/;
            return regexPassword.test(value) ? undefined : message || 'Mật khẩu chưa đủ mạnh!'
        }
    }
}

validator.isComfirmed = function(selector , getComfirmValue , message) {
    return {
        selector: selector,
        test: function(value) {
            return value === getComfirmValue() ? undefined : message || 'Dữ liệu không trùng khớp!';
        }
    }
}