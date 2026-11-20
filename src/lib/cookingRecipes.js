// Guided household recipes. Quantities are for four servings; the cooking buddy scales them.
export const cookingRecipes = [
  { id:'chicken-adobo', name:'Chicken adobo + tofu portion', type:'Dinner', time:40, ingredients:[['Chicken',450,'g'],['Firm tofu',200,'g'],['Soy sauce',60,'ml'],['Vinegar',60,'ml'],['Garlic',6,'cloves'],['Onion',1,'pc'],['Bay leaves',2,'pcs'],['Black pepper',1,'tsp'],['Water',120,'ml']], steps:[
    ['Prepare the aromatics','Mince garlic and slice the onion. Pat chicken dry and cube tofu.',0],
    ['Brown the chicken','Heat a little oil. Brown chicken pieces on both sides, about 3 minutes per side.',360],
    ['Build the adobo sauce','Add garlic, soy sauce, vinegar, water, bay leaves and pepper. Bring to a boil without stirring.',180],
    ['Simmer until tender','Cover and simmer gently until chicken is cooked through and tender, about 20 minutes. Keep tofu separate.',1200],
    ['Cook your tofu portion','In a small pan, simmer tofu with a ladle of the adobo sauce for 5 minutes.',300],
    ['Finish and serve','Taste the sauce, adjust if needed, and serve with rice. Refrigerate leftovers promptly.',0]
  ]},
  { id:'sinigang-tilapia', name:'Sinigang na tilapia', type:'Dinner', time:30, ingredients:[['Tilapia',800,'g'],['Radish',1,'pc'],['Tomatoes',2,'pcs'],['Onion',1,'pc'],['Kangkong',1,'bunch'],['Sinigang mix',1,'pack'],['Water',1.5,'L']], steps:[
    ['Prepare vegetables','Wash kangkong. Slice radish, tomatoes and onion.',0],
    ['Start the broth','Bring water, tomatoes and onion to a boil.',300],
    ['Cook the radish','Add radish and simmer until it starts to soften.',480],
    ['Season the soup','Add sinigang mix and taste the broth.',60],
    ['Cook the fish','Add tilapia pieces and simmer gently until opaque and cooked through. Avoid vigorous stirring.',480],
    ['Add kangkong','Add kangkong and cook just until wilted. Serve hot.',90]
  ]},
  { id:'pork-giniling-sayote', name:'Pork giniling with sayote + tofu', type:'Dinner', time:30, ingredients:[['Ground pork',250,'g'],['Firm tofu',200,'g'],['Sayote',1,'pc'],['Carrot',1,'pc'],['Tomatoes',2,'pcs'],['Onion',1,'pc'],['Garlic',3,'cloves'],['Soy sauce',1,'tbsp'],['Water',120,'ml']], steps:[
    ['Prep the vegetables','Peel and dice sayote and carrot. Chop tomato, onion and garlic.',0],
    ['Sauté aromatics','Cook garlic and onion in a little oil until fragrant.',120],
    ['Cook the pork','Add ground pork and cook, breaking it up, until no pink remains.',420],
    ['Add vegetables','Add tomato, sayote, carrot, soy sauce and water. Cover and simmer until tender.',600],
    ['Prepare tofu portion','In a small pan, cook tofu with a few spoonfuls of the vegetable sauce.',240],
    ['Serve','Taste and adjust seasoning. Serve with rice.',0]
  ]},
  { id:'tortang-talong', name:'Tortang talong', type:'Dinner', time:35, ingredients:[['Eggplant',4,'pcs'],['Eggs',5,'pcs'],['Onion',1,'pc'],['Tomato',1,'pc'],['Cooking oil',2,'tbsp'],['Salt',0.5,'tsp'],['Pepper',0.25,'tsp']], steps:[
    ['Roast the eggplants','Char eggplants over a flame or under a grill, turning until the skin is blistered and flesh soft.',720],
    ['Cool and peel','Let eggplants cool enough to handle. Peel off the skin, keeping stems attached.',300],
    ['Flatten','Gently flatten each eggplant with a fork.',0],
    ['Mix the egg','Beat eggs with chopped onion, tomato, salt and pepper.',90],
    ['Fry the omelettes','Dip each eggplant in egg mixture and fry over medium heat until golden. Flip and cook the other side.',360],
    ['Serve','Drain briefly and serve with rice and tomato-onion salad.',0]
  ]},
  { id:'ginataang-kalabasa', name:'Ginataang kalabasa at sitaw', type:'Dinner', time:30, ingredients:[['Squash',500,'g'],['Sitaw',200,'g'],['Firm tofu',200,'g'],['Coconut milk',400,'ml'],['Garlic',3,'cloves'],['Onion',1,'pc'],['Water',120,'ml'],['Salt',0.5,'tsp']], steps:[
    ['Prepare vegetables','Peel and cube squash. Cut sitaw into bite-sized lengths. Cube tofu.',0],
    ['Sauté aromatics','Cook garlic and onion in a little oil until fragrant.',120],
    ['Simmer squash','Add squash, coconut milk and water. Simmer until squash is nearly tender.',600],
    ['Add sitaw and tofu','Stir in sitaw and tofu. Simmer until beans are tender but still hold their shape.',360],
    ['Season','Season with salt and pepper. Add a splash of water if the sauce gets too thick.',30],
    ['Serve','Serve warm with rice.',0]
  ]},
  { id:'chicken-afritada', name:'Chicken afritada + tofu portion', type:'Dinner', time:45, ingredients:[['Chicken',450,'g'],['Firm tofu',200,'g'],['Potatoes',2,'pcs'],['Carrot',1,'pc'],['Tomato sauce',120,'ml'],['Tomatoes',2,'pcs'],['Onion',1,'pc'],['Garlic',3,'cloves'],['Water',250,'ml']], steps:[
    ['Prep','Cut potatoes and carrot into chunks. Chop onion, garlic and tomatoes.',0],
    ['Brown chicken','Brown chicken in a pot for 3 minutes per side.',360],
    ['Sauté aromatics','Add garlic, onion and tomatoes. Cook until softened.',240],
    ['Simmer','Add tomato sauce and water. Cover and simmer until chicken is nearly cooked.',900],
    ['Add vegetables','Add potatoes and carrots. Simmer until tender and chicken is fully cooked.',600],
    ['Make tofu portion','Warm tofu in a separate small pan with some sauce and vegetables. Serve both with rice.',240]
  ]},
  { id:'monggo', name:'Monggo with pork + tofu portion', type:'Dinner', time:55, ingredients:[['Dry monggo',250,'g'],['Pork',150,'g'],['Firm tofu',150,'g'],['Tomato',1,'pc'],['Onion',1,'pc'],['Garlic',3,'cloves'],['Malunggay',1,'bunch'],['Water',1.5,'L']], steps:[
    ['Rinse monggo','Pick through and rinse monggo. No soaking required, though soaking shortens cooking time.',0],
    ['Boil the beans','Cover monggo with water and simmer until soft, adding water as needed.',2400],
    ['Sauté pork','In another pot, cook pork with garlic, onion and tomato until browned and fragrant.',480],
    ['Combine','Add cooked monggo and enough cooking liquid to make a stew. Simmer together.',480],
    ['Make your portion','Take out a meat-free serving and add tofu. Keep the rest with pork.',180],
    ['Add malunggay','Stir malunggay into both portions and cook until wilted. Serve.',90]
  ]},
  { id:'paksiw-bangus', name:'Paksiw na bangus', type:'Dinner', time:30, ingredients:[['Bangus',800,'g'],['Eggplant',1,'pc'],['Ginger',30,'g'],['Garlic',4,'cloves'],['Vinegar',60,'ml'],['Water',120,'ml'],['Black pepper',0.5,'tsp'],['Salt',0.5,'tsp']], steps:[
    ['Prepare','Slice ginger, crush garlic and cut eggplant. Clean and portion bangus.',0],
    ['Layer the pot','Arrange ginger, garlic and fish in a shallow pot. Add vinegar, water, pepper and salt.',0],
    ['Bring to a boil','Bring to a boil uncovered. Do not stir while the vinegar is sharp.',180],
    ['Simmer','Cover and simmer gently until fish is cooked through.',720],
    ['Add eggplant','Add eggplant and simmer until tender.',300],
    ['Serve','Taste the broth and serve with rice.',0]
  ]},
  { id:'chopsuey', name:'Chopsuey with chicken + tofu portion', type:'Dinner', time:30, ingredients:[['Chicken',300,'g'],['Firm tofu',200,'g'],['Cabbage',250,'g'],['Carrot',1,'pc'],['Sayote',1,'pc'],['Garlic',3,'cloves'],['Soy sauce',1,'tbsp'],['Cornstarch',1,'tbsp'],['Water',180,'ml']], steps:[
    ['Prep vegetables','Slice cabbage, carrot and sayote. Mince garlic. Mix cornstarch with water.',0],
    ['Cook chicken','Stir-fry chicken until cooked through. Remove and set aside.',480],
    ['Stir-fry vegetables','Cook garlic, then add carrot and sayote. Add cabbage last.',360],
    ['Make sauce','Return chicken, add soy sauce and cornstarch slurry. Stir until glossy.',120],
    ['Make tofu portion','Warm tofu with a separate scoop of vegetables and sauce in a small pan.',180],
    ['Serve','Serve immediately while vegetables are still crisp.',0]
  ]},
  { id:'tofu-sisig', name:'Tofu sisig', type:'Dinner', time:25, ingredients:[['Firm tofu',500,'g'],['Onions',2,'pcs'],['Eggs',2,'pcs'],['Calamansi',4,'pcs'],['Soy sauce',1,'tbsp'],['Chili',1,'pc'],['Black pepper',0.25,'tsp'],['Cooking oil',2,'tbsp']], steps:[
    ['Press and cube tofu','Pat tofu dry and cut into small cubes.',0],
    ['Crisp the tofu','Pan-fry tofu in oil, turning until golden on most sides.',600],
    ['Cook onions','Add sliced onions and chili. Cook until just softened.',120],
    ['Season','Add soy sauce, pepper and calamansi juice. Toss well.',60],
    ['Add egg','Make space in the pan and scramble egg until just set, then combine.',120],
    ['Serve','Serve hot with rice and extra calamansi.',0]
  ]},
  { id:'pinakbet', name:'Pinakbet with pork + tofu portion', type:'Dinner', time:35, ingredients:[['Pork',150,'g'],['Firm tofu',150,'g'],['Squash',250,'g'],['Eggplant',1,'pc'],['Okra',100,'g'],['Sitaw',100,'g'],['Tomato',1,'pc'],['Onion',1,'pc'],['Garlic',3,'cloves'],['Water',180,'ml']], steps:[
    ['Prep vegetables','Cut squash, eggplant, okra and sitaw. Chop aromatics.',0],
    ['Brown pork','Sauté pork with garlic and onion until lightly browned.',480],
    ['Add tomato and squash','Add tomato, squash and water. Cover and simmer briefly.',360],
    ['Add remaining vegetables','Add sitaw, eggplant and okra. Simmer until tender.',480],
    ['Prepare tofu portion','Take a meat-free portion of vegetables and broth, then add tofu and simmer.',180],
    ['Serve','Taste and adjust seasoning. Serve with rice.',0]
  ]},
  { id:'fish-escabeche', name:'Fish escabeche', type:'Dinner', time:35, ingredients:[['Whole fish',800,'g'],['Carrot',1,'pc'],['Onion',1,'pc'],['Bell pepper',0.5,'pc'],['Vinegar',60,'ml'],['Sugar',1,'tbsp'],['Water',80,'ml'],['Cornstarch',1,'tsp']], steps:[
    ['Prepare fish and vegetables','Clean fish and pat dry. Slice carrot, onion and bell pepper.',0],
    ['Fry fish','Season fish lightly and pan-fry until golden and cooked through.',720],
    ['Sauté vegetables','In a clean pan, sauté onion, carrot and bell pepper until slightly softened.',240],
    ['Make sweet-sour sauce','Add vinegar, sugar and water. Simmer briefly. Add cornstarch slurry.',180],
    ['Finish','Pour sauce and vegetables over the fish.',30],
    ['Serve','Serve with rice. Keep fish refrigerated promptly after dinner.',0]
  ]},
  { id:'chicken-tinola', name:'Chicken tinola + tofu broth portion', type:'Dinner', time:45, ingredients:[['Chicken',450,'g'],['Firm tofu',200,'g'],['Green papaya',300,'g'],['Ginger',40,'g'],['Onion',1,'pc'],['Garlic',3,'cloves'],['Malunggay',1,'bunch'],['Water',1.2,'L']], steps:[
    ['Prepare','Slice ginger, onion and garlic. Peel and cube papaya.',0],
    ['Sauté aromatics','Cook ginger, garlic and onion until fragrant.',180],
    ['Cook chicken','Add chicken and cook until the outside is no longer pink.',360],
    ['Simmer broth','Add water and simmer until chicken is fully cooked and tender.',1200],
    ['Add papaya','Add green papaya and simmer until tender.',480],
    ['Make tofu portion and finish','Take some broth into a small pot, add tofu, then add malunggay to both pots until wilted.',180]
  ]},
  { id:'vegetable-omelette', name:'Vegetable omelette + tofu', type:'Dinner', time:20, ingredients:[['Eggs',6,'pcs'],['Firm tofu',250,'g'],['Cabbage',150,'g'],['Carrot',1,'pc'],['Onion',1,'pc'],['Cooking oil',2,'tbsp'],['Salt',0.5,'tsp']], steps:[
    ['Prep vegetables','Shred cabbage and carrot. Finely chop onion.',0],
    ['Beat eggs','Beat eggs with vegetables, salt and pepper.',90],
    ['Cook omelettes','Pour into a lightly oiled pan in batches. Cook until set, then flip carefully.',360],
    ['Fry tofu','Pan-fry tofu cubes until golden on the edges.',480],
    ['Serve','Serve omelettes and tofu with rice.',0]
  ]}
];
