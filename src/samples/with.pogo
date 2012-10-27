things = []

specification = {

  describe (thing) as (attributes) = things.push [thing, attributes]

  made of (stuff) = { material = stuff }
  
  solid material = { breakable = false }
  
  (name) orientation = { orientation = name }
  
}


with (specification)
  
  describe 'wall' as [
    
    made of (solid material)
  
    'vertical' orientation
  
  ]
    