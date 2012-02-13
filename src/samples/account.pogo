create account, balance = {
    withdraw @amount =
        if (balance >= amount)
            balance = balance - amount
        else
            throw 'insufficient funds'

    deposit @amount =
        balance = balance + amount
    
    balance? =
        balance
}

account = create account, balance 100

account: withdraw 30
account: deposit 100
console: log (account: balance?)
