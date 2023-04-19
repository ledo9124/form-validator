// Đối tượng validator
function validator(options) {

    function Validate(inputElement , rule){
        let errorElement = inputElement.parentElement.querySelector(options.errorSelector);
        let errorMessage = rule.test(inputElement.value);

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

    }

    let formElement = document.querySelector(options.form);

    if(formElement) {

        options.rules.forEach(rule => {
            
            let inputElement = formElement.querySelector(rule.selector); 

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

validator.isRequired = function(selector) {
    return {
        selector: selector,
        test: function(value) {
            return value.trim() ? undefined : 'Vui lòng nhập trường này!';
        }
    };
}

validator.isEmail = function(selector) {
    return {
        selector: selector,
        test: function(value) {
            const regexEmail = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i;
            return regexEmail.test(value) ? undefined : 'Trường này phải là email!'
        }
    };
}

validator.isPassword = function(selector) {
    return {
        selector: selector,
        test: function(value) {
            const regexPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*]).{8,}$/;
            return regexPassword.test(value) ? undefined : 'Mật khẩu chưa đủ mạnh!'
        }
    }
}