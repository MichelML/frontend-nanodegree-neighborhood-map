// This is a simple *viewmodel* - JavaScript that defines the data and behavior of your UI
function AppViewModel() {
    AVM = this;
    AVM.firstName = "Michel";
    AVM.lastName = "Moreau Lapointe";
    AVM.extension = "hello";
    AVM.extendName = function() {
        appViewModel.firstName += appViewModel.extension;
        console.log(appViewModel.firstName);
    };
}

// Activates knockout.js
ko.applyBindings(new AppViewModel());
