// Đối tượng validator
function validator(options) {

    let selectorRules = {};

    function Validate(inputElement , rule){
        let errorElement = inputElement.parentElement.querySelector(options.errorSelector);
        let errorMessage;

        let rules = selectorRules[rule.selector];

        for (var i in rules) {
            errorMessage = rules[i](inputElement.value);
            if(errorMessage) break;
        };

        if(errorMessage) {
            errorElement.innerText = errorMessage;
            if(inputElement.parentElement.classList.contains('valid')){
                inputElement.parentElement.classList.remove('valid');
            };
            inputElement.parentElement.classList.add('invalid');
        }else {
            errorElement.innerText = 'Hợp lệ!';
            inputElement.parentElement.classList.remove('invalid');
            inputElement.parentElement.classList.add('valid');
        }

        return !errorMessage;
    }

    let formElement = document.querySelector(options.form);

    if(formElement) {

        formElement.onsubmit = function(e) {
            e.preventDefault();

            let isFormValid = true;

            options.rules.forEach(rule => {
                let inputElement = formElement.querySelector(rule.selector);    
                let isValid = Validate(inputElement , rule);

                if(!isValid) {
                    isFormValid = false;
                };
            });

            if(isFormValid){
                if(typeof options.onSubmit === 'function') {
                    let enableInputs = formElement.querySelectorAll('[name]:not([disable])');
                    let formValues = Array.from(enableInputs).reduce(function(values , input){
                        return (values[input.name] = input.value) && values;
                    }, {});
                    options.onSubmit(formValues);     
                }else {
                    formElement.submit();
                }
            }
        }

        options.rules.forEach(rule => {
            
            let inputElement = formElement.querySelector(rule.selector); 

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
                    let errorElement = inputElement.parentElement.querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    if(inputElement.parentElement.classList.contains('valid')){
                        inputElement.parentElement.classList.remove('valid');
                    };
                    inputElement.parentElement.classList.remove('invalid');
                };
            }
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