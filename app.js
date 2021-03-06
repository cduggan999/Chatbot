// Module Patterns
// 
// BUDGET CONTROLLER
var budgetController = (function() {
    
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(incTotal){
        if (incTotal > 0){
            this.percentage = Math.round((this.value / incTotal) * 100); 
        }
        else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach((current) => sum += current.value);
     
        
        // Assign Total value to Income or Expense
        data.totals[type] = sum;
            
    };
    
    var data = {
        allItems : {
            expense: [],
            income: []
        },
        totals : {
            expense: 0,
            income: 0
        },
        budget: 0,
        percentage: -1
    };
    
    return {
        addItem: function(type, des, val){
            var newItem, ID;
            
            // ID of new item should be one greater than size of array
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
               ID = 0; 
            }
             
            // Create new item based on 'inc' or 'exp'
            if (type === 'expense'){
                newItem = new Expense(ID, des, val);
            }
            else if (type === 'income'){
                newItem = new Income(ID, des, val);
            }
            
            // Push into new data structure
            data.allItems[type].push(newItem);
            
            // Returen the new element
            return newItem;
        },
        
        deleteItem: function(type, id){
            var idArray, index;
            // Find index of item to delete
            idArray = data.allItems[type].map(function(current){
                // returns an array with just the id's
                return current.id;
            });
            
            
            for (var i =0; i <idArray.length; i++){
            };
            
            index = idArray.indexOf(id);
            
            if (index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function(){
        
            // Calculate total income and expenses
            calculateTotal('income');
            calculateTotal('expense');
    
            //Calculate budget: income - expenses
            data.budget = data.totals.income - data.totals.expense;
    
            // Calculate the percentage of income that we spent
            if (data.totals.income > 0){
                data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
            }
            else {
                data.percentage = -1;
            }
        },
        
        calculatePercentages: function(){
        
            // Calculate percentage for each item in expense array
            data.allItems.expense.forEach((current) => current.calcPercentage(data.totals.income));
            
            console.log('calculatePercenage called!');
        },
        
        getPercentages: function() {
            var percArray;
            percArray = data.allItems.expense.map(function(current){
                return current.getPercentage();
            });
            
            return percArray;
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalIncome: data.totals.income,
                totalExpense: data.totals.expense,
                percentage: data.percentage
            };
        },
        
        // For Testing, remove when finished
        testing: function(){
            console.log(data);
        }
    };
    
})();

////////////////////////////////////////////////////////////

// UI CONTROLLER
var UIController = (function() {
    
    var DOMStrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue : '.add__value',
        inputBtn : '.add__btn',
        container : '.container',
        incomeContainer : '.income__list',
        expensesContainer : '.expenses__list',
        budgetIncome : '.budget__income--value',
        expItemPerc : '.item__percentage',
        budgetExpenses : '.budget__expenses--value',
        budgetNet : '.budget__value',
        percentageExpenseBudget : '.budget__expenses--percentage',
        dateLabel : '.budget__title--month'
    };
    
    var formatNumber = function(num, type) {
            var numSplit, int, dec;
            /* + or - before number
                exactly 2 decimal places
                comma seperated by thousands
            
            */
            num = Math.abs(num);
            // set to 2 decimal places
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            int = numSplit[0];
            dec = numSplit[1];
            
            if (int.length > 6){
                int = int.substr(0, int.length - 6) + ',' + int.substr(int.length - 6, 3) + ',' + int.substr(int.length - 3, 3);
            }
            else if (int.length > 3){
                int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
            }
            
        
            // return sign + int + dec
            return (type === 'income' ? '+' : '-') + ' ' + int + '.' + dec;
    };
    
    var nodeListForEach = function(list, callback) {
        for (var i=0; i < list.length; i++){
            callback(list[i], i);
        }
    };
    
    return {
        getIntput: function() {
            return {
                type : document.querySelector(DOMStrings.inputType).value, // inc or exp
                desc : document.querySelector(DOMStrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMStrings.inputValue).value)
            };
        },
        
        addListItem: function(obj, type) {
            // 1. Create HTML string with placeholder text
            if (type === 'income'){
                element = DOMStrings.incomeContainer;
                
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if (type === 'expense'){ //replace percentage 
                element = DOMStrings.expensesContainer;
                
                 html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            // Replace placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteListItem: function(selectorID) {
            var element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },
        
        clearFields: function() {
            var fieldsList, fieldsArray;
            fieldsList = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);
            
            // Use the slice function of the Array prototype
            fieldsArray = Array.prototype.slice.call(fieldsList);
            
            fieldsArray.forEach(function(current, index, array) {
                current.value = '';
            })
            
            // Set focus back to description field
            fieldsArray[0].focus();
        },
        
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'income' : type = 'expense';
            
            document.querySelector(DOMStrings.budgetNet).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMStrings.budgetIncome).textContent = formatNumber(obj.totalIncome, 'income');
            document.querySelector(DOMStrings.budgetExpenses).textContent = formatNumber(obj.totalExpense, 'expense');
            if (obj.percentage > 0){
                document.querySelector(DOMStrings.percentageExpenseBudget).textContent = obj.percentage + '%';
            }
            else {
                document.querySelector(DOMStrings.percentageExpenseBudget).textContent ='---';
            }
                   
        },
        
        displayPercentages: function(percentages){
            
            // Returns a nodeList of all the percentages
            var perFields = document.querySelectorAll(DOMStrings.expItemPerc);
            
            // Function to loop through eac item in list and apply a callback function to it
            nodeListForEach(perFields, function(current, index) {
                
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                }
                else {
                     current.textContent = '---';
                }             
            });
            console.log(' called UI displayPercentages');

        },
        
        displayDate : function() {
            var now, month, monthArray, year;
            
            var monthArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            now = new Date(); 
            
            month = monthArray[now.getMonth()];
            year = now.getFullYear();
            
            document.querySelector(DOMStrings.dateLabel).textContent = month + ' ' + year;
        },
        
        changedType : function() {
            // Changes highlight border between green and red
            var fields = document.querySelectorAll(
                DOMStrings.inputType +',' +
                DOMStrings.inputDescription +',' +
                DOMStrings.inputValue);
            
            
            nodeListForEach(fields, function(curr) {
                curr.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
        },
        
        getDOMStrings: function() {
            return DOMStrings;
        }
    };
    
})();

////////////////////////////////////////////////////////////////////////////////

// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListners = function(){
        var DOM = UICtrl.getDOMStrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function(event) {
        // 'Enter' = keycode 13
            if (event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    }
    

    var ctrlAddItem = function(){
        var input, newItem;
        
        // 1. Get the input field data
        input = UICtrl.getIntput();
        console.log(input);
        
        if (input.desc !== "" && !isNaN(input.value) && input.value > 0){
            
            // 2. Add item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.desc, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear input fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();
            
            // 6. Update the percentages
            updatePercentages();
        }
    };
    
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        
        // Transverse up the DOM to get desired element ID
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        // If Item ID found, delete
        if (itemID) {
            
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            // 1. Delete item from the data structure
            budgetCtrl.deleteItem(type, ID);
            
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            
            // 3. Update the UI to show new budget
            updateBudget();
            
            // 4. Update the percentages
            updatePercentages();
        }
    };
    
    var updateBudget = function() {
        
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget in the UI
        UICtrl.displayBudget(budget);
    };
    
    var updatePercentages = function() {
        var allPercentages;
        
        // 1. Calculate the Percentage
        budgetCtrl.calculatePercentages();
        
        
        // 2. Return the Percentage
        allPercentages = budgetCtrl.getPercentages();
        
        // 3. Display the percentage in the UI
        UICtrl.displayPercentages(allPercentages);
    };
    
    return {
        init: function(){
            console.log('Application has started!!');
            // Reset the budget display
            UICtrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpense: 0,
                percentage: -1
            });
            setupEventListners();
            // Display Current Date (Month + Year)
            UICtrl.displayDate();
        }
    };
    
})(budgetController, UIController);

controller.init();