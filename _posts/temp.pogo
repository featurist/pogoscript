thermometer reading (continuation) =
    minute = 0
    day = 0

    next minute () =
        ++minute
        if (minute >= 24 * 60)
            minute := 0
            ++day
        
    current temperature () =
        Math.sin(Math.PI * minute / 60 / 12) * 2.5 + 0.5 * day

    set interval
        next minute ()
        continuation (nil, {minute = minute, hour = minute / 60, temperature = current temperature ()})
    100

where! (block) =
    if (block!)
        continuation ()

avg (items) =
    console.log (items)
    items.reduce @(l, r) @{ l + r } / items.length

last key = nil
last group = []

group! (reading) by (group key) aggregate (aggregate) =
    if (last key == nil)
        last key := group key! (reading)
    else
        current key = group key! (reading)
        if (last key != current key)
            continuation (nil, aggregate! (last group))
            last key := current key
            last group := [reading]
        else
            lasg group.push (reading)
        
reading = thermometer reading!

console.log ("reading", reading.temperature)

where!
    reading.temperature > 0

console.log ("above zero", reading.temperature)

hourly average = group! (reading) by
    reading.hour
aggregate @(readings)
    avg [r.temperature, where: r <- readings]
    
console.log ("average temp", hourly average)
