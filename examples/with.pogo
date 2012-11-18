things = {}

merge (traits) into (thing) =
  for each @(trait) in (traits)
    for @(attr) in (trait) @ { thing.(attr) = trait.(attr) }

spec = {

  describe (thing) as (traits) = merge (traits) into (things.(thing) = {})

  made of (stuff) = { material = stuff }
  
  solid material = { breakable = false }
  
  (direction) orientation = { orientation = direction }
  
}


with (spec)
  
  describe 'wall' as [
    
    made of (solid material)
  
    'vertical' orientation
  
  ]
  

console.log (things)

// { wall: { material: { breakable: false }, orientation: 'vertical' } }