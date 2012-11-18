create account (balance: 0) = {
    balance = balance

    withdraw (amount) =
        if (self.balance >= amount)
            self.balance = self.balance - amount
        else
            throw 'insufficient funds'

    deposit (amount) =
        self.balance = self.balance + amount
    
    current balance () =
        self.balance
}

account = create account (balance: 100)

account.withdraw 30
account.deposit 100
console.log (account.current balance ())
