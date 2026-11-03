const photo=name=>'/gully-cricket/'+name+'.png';
export const gullyGallery=[
 ['gallery-01-hero','Terrace House','A brick neighbourhood house with an open terrace, green shutters and four figures playing cricket in front.'],
 ['gallery-02-five-builds','Five builds','The same set rebuilt five ways: Terrace House, Open Gully, Chai Corner, Family Courtyard and Match-Day Pavilion.'],
 ['gallery-03-crease','At the crease','A brick girl at the stumps with her bat, seen past the shoulder of the bowler holding a red ball.'],
 ['gallery-04-window','The window','A red ball inside a window with green shutters and one cracked pane, and a girl with a bat, hand over her mouth.'],
 ['gallery-05-players','The players','Four brick figures in a row: a girl with a bat, a boy with a ball, a boy in a red shirt and a grey-haired elder, with three stumps.'],
 ['gallery-06-at-home','At home','Two children lying on a rug, playing cricket with the brick set while their grandmother watches from the sofa.'],
 ['gallery-07-kids-room','In a bedroom','A boy resting his chin on his desk, moving the brick batter with one finger.'],
 ['gallery-08-desk','On a desk','The Chai Corner build on a work desk at night, beside a glass of tea, with an old cricket bat against the wall.'],
 ['gallery-09-dimensions','Size and space','The Terrace House with its size: about 18 cm wide, 13 cm deep and 12 cm tall.']
].map(([file,label,alt])=>({image:photo(file),label,alt}));
export const gullyScenes=[
 ['terrace-house','Terrace House','Cricket in front, the neighbour watching from above. Mind the window.'],
 ['open-gully','Open Gully','Two walls and one long lane. Only straight shots count.'],
 ['chai-corner','Chai Corner','Innings break. The bat rests on the wall while someone pours the tea.'],
 ['family-courtyard','Family Courtyard','Houses on three sides, so every wall is a fielder.'],
 ['match-day-pavilion','Match-Day Pavilion','The neighbourhood final. Everyone takes a seat on the steps.'],
 ['yours','Yours','The next build is yours to imagine.']
].map(([id,label,line],i)=>({id,label,line,image:photo(`switch-${i+1}-${id}`),alt:`${label}. ${line}`}));
export const gullyExplorer=[{...gullyGallery[1],id:'overview',line:'Build. Imagine. Create.'},...gullyScenes];
export const gullyDescription='An Indian neighbourhood lane in about 600 bricks. Build it five ways, or invent your own. Your gully. Your rules.';
export const gullyDisclaimer='An original Taksh design of a fictional Indian neighbourhood. It is not affiliated with or endorsed by any cricket board, team or player. The home and street scenes on this page are imagined; the model shown in them is the Taksh set. The set has no lights. Taksh is an independent brand whose bricks fit other leading brands.';
