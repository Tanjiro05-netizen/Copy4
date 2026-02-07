-- Timeline Events Part 1: Pre-History & Birth of Theory (1649-1871)
-- Run this AFTER 20260120100000_timeline_events.sql

-- ============================================
-- I. THE PRE-HISTORY (Age of Bourgeois Revolutions)
-- ============================================

INSERT INTO timeline_events (year, month, day, title, description, detailed_description, category, importance, location, related_people, tags, wikipedia_url, image_url) VALUES

(1649, 1, 30, 'Execution of Charles I', 'The English Revolution beheads the divine right of kings', 
'The English Revolution (Cromwell) beheads the divine right of kings, establishing the supremacy of Parliament. The Diggers led by Gerrard Winstanley occupy St. George''s Hill, demanding common ownership of land ("The Earth is a Common Treasury"), prefiguring communism.',
'revolution', 'critical', 'Whitehall, London',
ARRAY['Oliver Cromwell', 'Charles I', 'Gerrard Winstanley'],
ARRAY['english-revolution', 'bourgeois-revolution', 'diggers'],
'https://en.wikipedia.org/wiki/Execution_of_Charles_I',
'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/The_Execution_of_Charles_I_of_England.jpg/1280px-The_Execution_of_Charles_I_of_England.jpg'),

(1789, 7, 14, 'Storming of the Bastille', 'The French Revolution begins', 
'The urban poor (sans-culottes) provide the shock troops for the bourgeois National Assembly. The fall of the Bastille marks the symbolic beginning of the French Revolution.',
'revolution', 'critical', 'Paris, France',
ARRAY['Louis XVI'],
ARRAY['french-revolution', 'bastille', 'sans-culottes'],
'https://en.wikipedia.org/wiki/Storming_of_the_Bastille',
'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Prise_de_la_Bastille.jpg/1280px-Prise_de_la_Bastille.jpg'),

(1791, 8, NULL, 'Haitian Revolution Begins', 'The only successful slave revolt in history', 
'Toussaint Louverture leads the only successful slave revolt in history, forcing the Enlightenment to confront its racial hypocrisy. Establishes that "Rights of Man" must include the Black slave.',
'revolution', 'critical', 'Saint-Domingue (Haiti)',
ARRAY['Toussaint Louverture'],
ARRAY['haiti', 'slave-revolt', 'anti-colonialism'],
'https://en.wikipedia.org/wiki/Haitian_Revolution',
'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Toussaint_L%27Ouverture.jpg/800px-Toussaint_L%27Ouverture.jpg'),

(1793, 1, 21, 'Execution of Louis XVI', 'The Jacobin Terror begins under Robespierre', 
'The "Committee of Public Safety" centralizes power to defend the revolution against feudal Europe. The execution marks the radicalization of the revolution.',
'revolution', 'major', 'Paris, France',
ARRAY['Louis XVI', 'Maximilien Robespierre'],
ARRAY['french-revolution', 'jacobin', 'terror'],
'https://en.wikipedia.org/wiki/Execution_of_Louis_XVI',
'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Execution_of_Louis_XVI.jpg/1024px-Execution_of_Louis_XVI.jpg'),

(1796, NULL, NULL, 'Conspiracy of Equals', 'First explicitly communist conspiracy', 
'Gracchus Babeuf and Sylvain Maréchal organize the first communist conspiracy, demanding abolition of private property. Babeuf executed in 1797.',
'revolution', 'major', 'Paris, France',
ARRAY['Gracchus Babeuf', 'Sylvain Maréchal'],
ARRAY['babeuf', 'conspiracy-of-equals', 'proto-communism'],
'https://en.wikipedia.org/wiki/Conspiracy_of_the_Equals',
'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Fran%C3%A7ois-No%C3%ABl_Babeuf.jpg/800px-Fran%C3%A7ois-No%C3%ABl_Babeuf.jpg'),

(1804, 1, 1, 'Independence of Haiti', 'The first Black Republic is declared', 
'Jean-Jacques Dessalines rips the white stripe from the French tricolor. Haiti becomes the first independent Black republic.',
'revolution', 'critical', 'Haiti',
ARRAY['Jean-Jacques Dessalines', 'Toussaint Louverture'],
ARRAY['haiti', 'independence', 'abolition'],
'https://en.wikipedia.org/wiki/Haitian_Declaration_of_Independence',
'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Jean-Jacques-Dessalines.jpg/800px-Jean-Jacques-Dessalines.jpg'),

(1815, 6, 18, 'Defeat of Napoleon at Waterloo', 'The Bourbon Restoration begins', 
'The Congress of Vienna tries to freeze history, but the Napoleonic Code remains, embedding bourgeois property relations across Europe.',
'historical', 'major', 'Waterloo, Belgium',
ARRAY['Napoleon Bonaparte'],
ARRAY['napoleon', 'waterloo', 'restoration'],
'https://en.wikipedia.org/wiki/Battle_of_Waterloo',
'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Sadler%2C_Battle_of_Waterloo.jpg/1280px-Sadler%2C_Battle_of_Waterloo.jpg'),

(1831, 11, NULL, 'Silk Weavers'' Revolt (Canuts)', 'First independent working class uprising', 
'Lyon silk weavers seize the city: "Live working or die fighting." The black flag is flown for the first time as a symbol of proletarian hunger.',
'revolution', 'major', 'Lyon, France',
ARRAY[],
ARRAY['canuts', 'lyon', 'workers-uprising', 'black-flag'],
'https://en.wikipedia.org/wiki/Canut_revolts',
'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Deveria_-_Combat_de_la_Croix-Rousse.jpg/1024px-Deveria_-_Combat_de_la_Croix-Rousse.jpg'),

-- ============================================
-- II. BIRTH OF THE THEORY (1844-1871)
-- ============================================

(1844, 8, NULL, 'Marx and Engels Meet in Paris', 'The partnership begins', 
'Marx and Engels meet at the Café de la Régence. They discover they arrived at the same conclusions independently. The most important intellectual partnership begins.',
'biography', 'critical', 'Paris, France',
ARRAY['Karl Marx', 'Friedrich Engels'],
ARRAY['marx', 'engels', 'partnership'],
'https://en.wikipedia.org/wiki/Karl_Marx',
'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Karl_Marx_001.jpg/800px-Karl_Marx_001.jpg'),

(1845, NULL, NULL, 'Marx Writes The German Ideology', 'Materialist conception of history formulated', 
'"The ruling ideas of each age have ever been the ideas of its ruling class." Unpublished in his lifetime.',
'publication', 'major', 'Brussels, Belgium',
ARRAY['Karl Marx', 'Friedrich Engels'],
ARRAY['german-ideology', 'historical-materialism'],
'https://en.wikipedia.org/wiki/The_German_Ideology',
NULL),

(1847, 6, NULL, 'Communist League Founded', 'Working Men of All Countries, Unite!', 
'The League of the Just becomes the Communist League, adopting "Working Men of All Countries, Unite!"',
'organization', 'major', 'London, England',
ARRAY['Karl Marx', 'Friedrich Engels'],
ARRAY['communist-league', 'international'],
'https://en.wikipedia.org/wiki/Communist_League',
NULL),

(1848, 3, NULL, 'The Springtime of Nations', 'Revolutions erupt across Europe', 
'Revolutions across Europe. Marx and Engels edit the Neue Rheinische Zeitung in Cologne as the extreme left wing of democracy.',
'revolution', 'critical', 'Europe',
ARRAY['Karl Marx', 'Friedrich Engels'],
ARRAY['1848', 'revolution', 'springtime-of-nations'],
'https://en.wikipedia.org/wiki/Revolutions_of_1848',
'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Maerz1848_berlin.jpg/1024px-Maerz1848_berlin.jpg'),

(1848, 6, NULL, 'June Days Uprising', 'Definitive split between bourgeoisie and proletariat', 
'Paris workers rise against the bourgeois republic. 3,000 slaughtered. The bourgeoisie and proletariat part ways definitively.',
'revolution', 'critical', 'Paris, France',
ARRAY[],
ARRAY['june-days', '1848', 'class-struggle'],
'https://en.wikipedia.org/wiki/June_Days_uprising',
'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Horace_Vernet-Barricade_rue_Soufflot.jpg/1024px-Horace_Vernet-Barricade_rue_Soufflot.jpg'),

(1852, NULL, NULL, 'The Eighteenth Brumaire', 'Analysis of 1848''s failure', 
'Marx analyzes 1848 and introduces "dictatorship of the proletariat." "History repeats itself, first as tragedy, then as farce."',
'publication', 'major', 'London, England',
ARRAY['Karl Marx'],
ARRAY['eighteenth-brumaire', 'class-analysis'],
'https://en.wikipedia.org/wiki/The_Eighteenth_Brumaire_of_Louis_Bonaparte',
NULL),

(1864, 9, 28, 'First International Founded', 'IWA established at St. Martin''s Hall', 
'Marx delivers the Inaugural Address: "The emancipation of the working classes must be conquered by the working classes themselves."',
'organization', 'critical', 'London, England',
ARRAY['Karl Marx'],
ARRAY['first-international', 'iwma'],
'https://en.wikipedia.org/wiki/International_Workingmen%27s_Association',
NULL),

(1869, NULL, NULL, 'SDAP Founded in Eisenach', 'First mass Marxist party', 
'August Bebel and Wilhelm Liebknecht found the Social Democratic Workers'' Party - the first mass Marxist party.',
'organization', 'major', 'Eisenach, Germany',
ARRAY['August Bebel', 'Wilhelm Liebknecht'],
ARRAY['sdap', 'german-socialism'],
'https://en.wikipedia.org/wiki/Social_Democratic_Workers%27_Party_of_Germany',
NULL),

(1871, 3, 18, 'The Paris Commune Begins', 'First workers'' government in history', 
'Workers seize power in Paris. They abolish the standing army and separate church from state. Marx: "The working class cannot simply lay hold of the ready-made state machinery."',
'revolution', 'critical', 'Paris, France',
ARRAY['Karl Marx'],
ARRAY['paris-commune', 'workers-government'],
'https://en.wikipedia.org/wiki/Paris_Commune',
'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Barricade18March1871.jpg/1024px-Barricade18March1871.jpg'),

(1871, 5, 28, 'Fall of the Paris Commune', 'Bloody Week - 20,000 executed', 
'The Commune crushed during Semaine Sanglante. 20,000 workers executed by Versailles forces.',
'revolution', 'critical', 'Paris, France',
ARRAY[],
ARRAY['paris-commune', 'bloody-week', 'martyrs'],
'https://en.wikipedia.org/wiki/Bloody_Week',
'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Communards_in_their_coffins.jpg/1024px-Communards_in_their_coffins.jpg');
