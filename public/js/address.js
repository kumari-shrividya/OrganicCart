
const FullNameEl = document.querySelector('#newFullName');
const HouseNameE1=document.querySelector('#newHouseName');
const StreetNameEl = document.querySelector('#newStreetName');
const  CityE1=document.querySelector("#City");
const StateEl = document.querySelector('#newState');
const PincodeEl = document.querySelector('#newPincode');
const PhoneEl = document.querySelector('#newContactNumber');


const checkFullName = () => {

    let valid = false;

    const min = 3,
        max = 25;

    const FullName = FullNameEl.value.trim();

    if (!isRequired(FullName)) {
        showError(FullNameEl, 'FullName cannot be blank.');
    } else if (!isBetween(FullName.length, min, max)) {
        showError(FullNameEl, `FullName must be between ${min} and ${max} characters.`)
    }
     else if(!isFullNameValid(FullName))
    {
        showError(FullNameEl, `Username is not valid.`)
    }
    else {
        showSuccess(FullNameEl);
        valid = true;
    }
    return valid;
};

const checkHouseName = () => {

    let valid = false;

    const min = 3,
        max = 25;

    const HouseName =HouseNameEl.value.trim();

    if (!isRequired(HouseName)) {
        showError(HouseNameEl, 'HouseName cannot be blank.');
    } else if (!isBetween(FullName.length, min, max)) {
        showError(HouseNameEl, `HouseName must be between ${min} and ${max} characters.`)
    }
    //  else if(!isFullNameValid(HouseName))
    // {
    //     showError(FullNameEl, `HouseName is not valid.`)
    // }
    else {
        showSuccess(HouseNameEl);
        valid = true;
    }
    return valid;
};

const checkStreetName = () => {

    let valid = false;

    const min = 3,
        max = 35;

    const StreetName =StreetNameEl.value.trim();

    if (!isRequired(StreetName)) {
        showError(StreetNameEl, 'StreetName cannot be blank.');
    } else if (!isBetween(StreetName.length, min, max)) {
        showError(StreetNameEl, `StreetName must be between ${min} and ${max} characters.`)
    }
    //  else if(!isFullNameValid(HouseName))
    // {
    //     showError(FullNameEl, `HouseName is not valid.`)
    // }
    else {
        showSuccess(StreetNameEl);
        valid = true;
    }
    return valid;
};
const checkCity = () => {

    let valid = false;

    const min = 3,
        max = 35;

    const City =CityEl.value.trim();

    if (!isRequired(City)) {
        showError(CityEl, 'City cannot be blank.');
    } else if (!isBetween(City.length, min, max)) {
        showError(CityEl, `City must be between ${min} and ${max} characters.`)
    }
    
    else {
        showSuccess(StreetNameEl);
        valid = true;
    }
    return valid;
};

const checkState= () => {

    let valid = false;

    const min = 3,
        max = 35;

    const State =StateEl.value.trim();

    if (!isRequired(State)) {
        showError(StateEl, 'State cannot be blank.');
    } else if (!isBetween(State.length, min, max)) {
        showError(StateEl, `State must be between ${min} and ${max} characters.`)
    }
   
    else {
        showSuccess(StateEl);
        valid = true;
    }
    return valid;
};

const checkPincode= () => {

    let valid = false;

    
    const Pincode =PincodeEl.value.trim();

    if (!isRequired(Pincode)) {
        showError(PincodeEl, 'Pincode cannot be blank.');
    } else if (!Pincode.length!=6) {
        showError(PincodeEl, `Pincode  must contain 6 digits.`)
    }
   
    else {
        showSuccess(PincodeEl);
        valid = true;
    }
    return valid;
};
const checkPhone=()=>{
    let valid = false;

 const phone=phoneE1.value.trim();

       if(!isRequired(phone)){
        showError(phoneE1, 'Phone Number  cannot be blank.');
       }
       else if(phone.length!=10){
        showError(phoneE1, 'Phone Number must contain 10 digits.');
       }
        else{
            showSuccess(phoneE1);
         valid = true;
        }
        return valid;

}


const isRequired = value => value === '' ? false : true;
const isBetween = (length, min, max) => length < min || length > max ? false : true;

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

// const button = document.querySelector('#signup');

// button.addEventListener("click", function (e) {

//     // prevent the form from submitting
//     e.preventDefault();

 // validate fields
 let isFullNameValid = checkFullName(),
 isHouseNameValid=checkHouseName(),
 isStreetNamelValid = checkStreetName(),
 isCityValid = checkCity(),
 isStateValid = checkState(),
 isPincodeValid = checkPincode(),
 isPhonevalid=checkPhone()

 

let isdataValid = isFullNameValid &&
isHouseNameValid && 
isStreetNamelValid &&
isCityValid &&
isStateValid &&
isPincodeValid &&
isPhonevalid

if(isdataValid){
    addAddress();
}

// })

//=========================addAddress======================================

function addAddress(){
    $(document).ready(function () {
 
                           var FullName=$('#newFullName').val()
                           var HouseName=$('#newHouseName').val()
                           var StreetName=$('#newStreetName').val()
                           var City=$('#newCity').val()
                           var State=$('#newState').val()
                           var Pincode=$('#newPincode').val()
                           var ContactNumber=$('#newContactNumber').val()
 
                           $.ajax({
                         url: '/address/addAddress',
                         method: 'POST',
                         data:{FullName:FullName,
                           HouseName:HouseName,
                           StreetName:StreetName,
                           City:City,
                           State:State,
                           Pincode:Pincode,
                           ContactNumber:ContactNumber
                   
                         },
                         success: function (data) {
                           if(data.success){
                                //  $("#addressModal").dialog("close");
 
                                // Render addresses inside the container
                                          const addressesContainer = document.querySelector('.subcontainer');
                                         //  addressesContainer.empty();
                                         // const addressesContainer=document.getElementById('#addressContainer')
                                         const lastAddress = data.addresses.pop();
                                         // data.addresses.forEach(function(addr) {
                                             const addressCard = `
                                                 <div class="address-cards">          
                                                     <div class="address-card">
                                                         <p class="address-title">${lastAddress.FullName}</p>
                                                         <p class="address-details">${lastAddress.HouseName}, ${lastAddress.StreetName},</p>
                                                         <p>${lastAddress.City}, ${lastAddress.Pincode},&nbsp;Mob: ${lastAddress.ContactNumber}</p>
                                                         <a style="font-size:small;border-radius: 10px;height:20px" href="/cart/selectBillingAddress/${lastAddress._id}" class="btn btn-secondary">Select Shipping  Address</a>
                                                     </div>
                                                 </div>
                                                 &nbsp;&nbsp; &nbsp;&nbsp;
                                             `;
                                             addressesContainer.insertAdjacentHTML('beforeend', addressCard);
                                         // });
                                         
                                           // $('#addressModal').css('display', 'none');
                                     
                                         
                           }
 
                         },
                         error: function(err) {
                    console.error('Error fetching addresses:', err);
                     }
                         
               })
             })
       //  })
   // })
 
  }
 
