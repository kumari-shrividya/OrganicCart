const couponCodeE1 = document.querySelector('#couponCode');
const couponDescriptionE1=document.querySelector('#couponDescription');
const expirationDateE1 = document.querySelector('#expirationDate');
const discountPercentE1 = document.querySelector('#discountPercent');
const minimumAmountE1 = document.querySelector('#minimumAmount');


const form = document.querySelector('#coupon_Form');


const isRequired = value => value === '' ? false : true;

const isBetween = (length, min, max) => length < min || length > max ? false : true;

const checkcouponCode = () => {
    let valid = false;
    const couponCode = couponCodeE1.value.trim();
    if (!isRequired(couponCode)) {
        showError(couponCodeE1, 'CouponCode cannot be blank.');
    }
    else if(couponCode.length<3) {
        showError(couponCodeE1, 'CouponCode must contain minimum 3 characters!');
    } else {
        showSuccess(couponCodeE1);
        valid = true;
    }

    return valid;

}

const checkcouponDescription = () => {
    let valid = false;
    const couponDescription = couponDescriptionE1.value.trim();
    if (!isRequired(couponDescription)) {
        showError(couponDescriptionE1, 'CouponDescription cannot be blank.');
    }
    else if(couponDescription.length<3) {
        showError(couponDescriptionE1, 'CouponDescription must contain minimum 3 characters!');
    } else {
        showSuccess(couponDescriptionE1);
        valid = true;
    }
    return valid;

    }


   const checkexpirationDate = () => {
    let valid = false;
    var today = new Date();
    const expirationDate = expirationDateE1.value.trim();
  
    if (!isRequired(expirationDate)) {
      
        showError(expirationDateE1, 'ExpirationDate cannot be blank.');
        
    }
    else if( today> new Date(expirationDate)){

        showError(expirationDateE1, 'ExpirationDate is not valid');
    } else {
        showSuccess(expirationDateE1);
        valid = true;
    }
    return valid;

    }

    const checkdiscountPercent = () => {
    let valid = false;
    const min=1,
       max=99;
    const discountPercent = discountPercentE1.value.trim();
    if (!isRequired(discountPercent)) {
        showError(discountPercentE1, 'discountPercent cannot be blank.');
    }
    // else if(parseInt(discountPercent)<0){
    //     showError(discountPercentE1, 'discountPercent cannot be negative.');
    // }
    else if(!isBetween(discountPercent, min, max)) {
        showError(discountPercentE1, `discountPercent is not valid`);
    } else {
        showSuccess(discountPercentE1);
        valid = true;
    }
    return valid;

    }

    const checkminimumAmount = () => {
        let valid = false
        const minimumAmount = minimumAmountE1.value.trim();
    if (!isRequired(minimumAmount)) {
        showError(minimumAmountE1, 'minimumAmount cannot be blank.');
    }
    // else if(parseInt(discountPercent)<0){
    //     showError(discountPercentE1, 'discountPercent cannot be negative.');
    // }
    else if(minimumAmount<1) {
        showError(minimumAmountE1, `minimumAmount is not valid`);
    } else {
        showSuccess(minimumAmountE1);
        valid = true;
    }
    return valid;

    }

    const showError = (input, message) => {
    // get the form-field element
    const formField = input.parentElement;
    // add the error class
    formField.classList.remove('success');
    formField.classList.add('error');

    // show the error message
    const error = formField.querySelector('small');
    error.textContent = message;
};

const showSuccess = (input) => {
    // get the form-field element
    const formField = input.parentElement;

    // remove the error class
    formField.classList.remove('error');
    formField.classList.add('success');

    // hide the error message
    const error = formField.querySelector('small');
    error.textContent = '';
}
  

    form.addEventListener('submit', function (e) {
    // prevent the form from submitting
    e.preventDefault();

    // validate fields
    let iscouponCodeValid = checkcouponCode(),
        iscouponDescription=checkcouponDescription(),
        isdiscountPercent = checkdiscountPercent(),
        isexpirationDate = checkexpirationDate(),
        isminimumAmount=checkminimumAmount()
       
        

    let isFormValid = iscouponCodeValid &&
         iscouponDescription &&
        isdiscountPercent &&
        isminimumAmount &&
        isexpirationDate;

    // submit to the server if the form is valid
    if (isFormValid) {

        var formData=$(this).serialize();
           
        $.ajax({
            type: 'POST',
            url:"/product/addCoupon",
            data:formData,
            success:function(res){
            if(res.success){ 

                // console.log(res);
                if(typeof res.message!='undefined'){
                    // document.getElementById("#message").innerHTML=res.message
                    // alert(res.message)
                    swal.fire({
                        title:res.message,
                        showConfirmButton:false,
                        showCloseButton:true
                    })
                }
                                         
             }     
                else{
                    if(typeof res.message!='undefined'){
                        // document.getElementById("#message").innerHTML=res.message
                    }
                    //  alert(res.message)
                    swal.fire({
                        title:res.message,
                        showConfirmButton:false,
                        showCloseButton:true
                    })
                }   
              },
              error: function(err) {
                console.error('Error', err);
                 }   
        });  
       
    }
});