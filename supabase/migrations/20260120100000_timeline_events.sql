-- Timeline Events Table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS timeline_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year INTEGER NOT NULL,
    month INTEGER, -- Optional: 1-12
    day INTEGER,   -- Optional: 1-31
    end_year INTEGER, -- Optional: for events spanning multiple years
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    detailed_description TEXT, -- Longer description for expanded view
    category TEXT NOT NULL CHECK (category IN ('biography', 'academic', 'publication', 'organization', 'historical', 'revolution', 'war', 'economic')),
    importance TEXT DEFAULT 'normal' CHECK (importance IN ('minor', 'normal', 'major', 'critical')),
    location TEXT,
    image_url TEXT,
    wikipedia_url TEXT,
    marxists_org_url TEXT,
    related_people TEXT[], -- Array of names
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient year-based queries
CREATE INDEX idx_timeline_events_year ON timeline_events(year);
CREATE INDEX idx_timeline_events_category ON timeline_events(category);

-- Trigger for updated_at
CREATE TRIGGER handle_timeline_events_updated_at
    BEFORE UPDATE ON timeline_events
    FOR EACH ROW
    EXECUTE FUNCTION handle_updated_at();

-- RLS Policies
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

-- Everyone can read timeline events
CREATE POLICY "Timeline events are publicly readable"
    ON timeline_events FOR SELECT
    USING (true);

-- Only admins can insert/update/delete
CREATE POLICY "Admins can manage timeline events"
    ON timeline_events FOR ALL
    USING (is_admin());

-- Seed Data: Key Historical Events
INSERT INTO timeline_events (year, month, day, title, description, detailed_description, category, importance, location, related_people, tags) VALUES
-- Marx & Engels Biographical
(1818, 5, 5, 'Birth of Karl Marx', 'Karl Marx is born in Trier, Prussia', 'Karl Heinrich Marx was born into a middle-class family in Trier, in the Prussian Rhineland. His father was a successful lawyer who had converted from Judaism to Protestantism.', 'biography', 'critical', 'Trier, Prussia', ARRAY['Karl Marx'], ARRAY['marx', 'birth']),
(1820, 11, 28, 'Birth of Friedrich Engels', 'Friedrich Engels is born in Barmen, Prussia', 'Friedrich Engels was born into a wealthy textile manufacturing family. He would become Marx''s closest collaborator and lifelong friend.', 'biography', 'critical', 'Barmen, Prussia', ARRAY['Friedrich Engels'], ARRAY['engels', 'birth']),
(1843, 6, 19, 'Marx Marries Jenny von Westphalen', 'Karl Marx marries his childhood friend Jenny von Westphalen', 'After a seven-year engagement, Marx married Jenny von Westphalen, daughter of a Prussian aristocrat. Their marriage lasted until her death in 1881.', 'biography', 'normal', 'Kreuznach, Prussia', ARRAY['Karl Marx', 'Jenny von Westphalen'], ARRAY['marx', 'marriage']),
(1883, 3, 14, 'Death of Karl Marx', 'Karl Marx dies in London', 'Marx died stateless in London at age 64. He was buried at Highgate Cemetery. Engels delivered the eulogy, declaring that "his name will endure through the ages."', 'biography', 'critical', 'London, England', ARRAY['Karl Marx', 'Friedrich Engels'], ARRAY['marx', 'death']),
(1895, 8, 5, 'Death of Friedrich Engels', 'Friedrich Engels dies in London', 'Engels died of throat cancer at age 74. He left his estate to the Marx daughters and bequeathed his extensive library to the German Social Democratic Party.', 'biography', 'major', 'London, England', ARRAY['Friedrich Engels'], ARRAY['engels', 'death']),

-- Lenin Biographical
(1870, 4, 22, 'Birth of Vladimir Lenin', 'Vladimir Ilyich Ulyanov (Lenin) is born', 'Lenin was born in Simbirsk into a middle-class family. His older brother Alexander was executed in 1887 for plotting to assassinate Tsar Alexander III.', 'biography', 'critical', 'Simbirsk, Russia', ARRAY['Vladimir Lenin'], ARRAY['lenin', 'birth']),
(1924, 1, 21, 'Death of Vladimir Lenin', 'Lenin dies after a series of strokes', 'Lenin died at age 53, having led the October Revolution and the early Soviet state. His embalmed body was placed in a mausoleum on Red Square.', 'biography', 'critical', 'Gorki, Soviet Russia', ARRAY['Vladimir Lenin'], ARRAY['lenin', 'death']),

-- Key Publications
(1848, 2, 21, 'Communist Manifesto Published', 'Marx and Engels publish The Communist Manifesto', 'Originally published in German as "Manifest der Kommunistischen Partei," this pamphlet became one of the most influential political documents in history, outlining the class struggle and calling for proletarian revolution.', 'publication', 'critical', 'London, England', ARRAY['Karl Marx', 'Friedrich Engels'], ARRAY['manifesto', 'communism', 'publication']),
(1867, 9, 14, 'Das Kapital Volume I Published', 'Marx publishes the first volume of Capital', 'The first volume of Das Kapital, subtitled "A Critique of Political Economy," was published in Hamburg. It analyzes capitalism''s laws of motion, including surplus value and exploitation.', 'publication', 'critical', 'Hamburg, Germany', ARRAY['Karl Marx'], ARRAY['capital', 'economics', 'publication']),
(1885, NULL, NULL, 'Das Kapital Volume II Published', 'Engels publishes Capital Volume II from Marx''s manuscripts', 'After Marx''s death, Engels edited and published the second volume of Capital, focusing on the circulation of capital.', 'publication', 'major', 'Hamburg, Germany', ARRAY['Karl Marx', 'Friedrich Engels'], ARRAY['capital', 'economics', 'publication']),
(1894, NULL, NULL, 'Das Kapital Volume III Published', 'Engels publishes Capital Volume III', 'The final volume of Capital, dealing with the process of capitalist production as a whole, including the tendency of the rate of profit to fall.', 'publication', 'major', 'Hamburg, Germany', ARRAY['Karl Marx', 'Friedrich Engels'], ARRAY['capital', 'economics', 'publication']),
(1902, NULL, NULL, 'What Is To Be Done? Published', 'Lenin publishes his influential pamphlet on party organization', 'Lenin''s treatise on revolutionary organization argued for a vanguard party of professional revolutionaries to lead the working class.', 'publication', 'major', 'Stuttgart, Germany', ARRAY['Vladimir Lenin'], ARRAY['lenin', 'party', 'publication']),
(1916, NULL, NULL, 'Imperialism, the Highest Stage of Capitalism', 'Lenin''s analysis of imperialism published', 'Lenin analyzed capitalism''s development into monopoly capitalism and imperialism, explaining World War I as an inter-imperialist conflict.', 'publication', 'major', 'Petrograd, Russia', ARRAY['Vladimir Lenin'], ARRAY['lenin', 'imperialism', 'publication']),

-- Revolutionary Events
(1848, 2, NULL, 'Revolutions of 1848 Begin', 'Wave of revolutions sweeps across Europe', 'Revolutionary movements erupted across Europe demanding liberal reforms, national unification, and workers'' rights. Though largely unsuccessful, they marked a turning point in European history.', 'revolution', 'major', 'Europe', ARRAY['Karl Marx', 'Friedrich Engels'], ARRAY['revolution', '1848']),
(1871, 3, 18, 'Paris Commune Established', 'First proletarian government in history', 'The Paris Commune was a radical socialist government that ruled Paris for two months. Marx called it "the glorious harbinger of a new society."', 'revolution', 'critical', 'Paris, France', ARRAY['Karl Marx'], ARRAY['commune', 'paris', 'revolution']),
(1871, 5, 28, 'Paris Commune Suppressed', 'The Commune falls after "Bloody Week"', 'The French Army crushed the Commune, killing an estimated 10,000-20,000 Communards in what became known as "La Semaine Sanglante" (Bloody Week).', 'revolution', 'major', 'Paris, France', ARRAY[], ARRAY['commune', 'paris', 'suppression']),
(1905, 1, 22, 'Bloody Sunday', 'Massacre sparks 1905 Russian Revolution', 'Imperial guards fired on peaceful demonstrators in St. Petersburg, killing hundreds and sparking the 1905 Revolution. It was a "dress rehearsal" for 1917.', 'revolution', 'major', 'St. Petersburg, Russia', ARRAY['Vladimir Lenin'], ARRAY['russia', 'revolution', '1905']),
(1917, 2, NULL, 'February Revolution', 'Tsar Nicholas II abdicates', 'Strikes and mutinies in Petrograd led to the abdication of Tsar Nicholas II, ending 300 years of Romanov rule and establishing a provisional government.', 'revolution', 'critical', 'Petrograd, Russia', ARRAY[], ARRAY['russia', 'revolution', '1917']),
(1917, 10, 25, 'October Revolution', 'Bolsheviks seize power in Russia', 'Led by Lenin and Trotsky, the Bolsheviks seized power from the Provisional Government. "We shall now proceed to construct the socialist order."', 'revolution', 'critical', 'Petrograd, Russia', ARRAY['Vladimir Lenin', 'Leon Trotsky'], ARRAY['russia', 'revolution', '1917', 'bolshevik']),
(1949, 10, 1, 'People''s Republic of China Founded', 'Mao proclaims the PRC', 'After decades of revolution and civil war, Mao Zedong proclaimed the establishment of the People''s Republic of China from Tiananmen Gate.', 'revolution', 'critical', 'Beijing, China', ARRAY['Mao Zedong'], ARRAY['china', 'revolution', 'prc']),
(1959, 1, 1, 'Cuban Revolution Triumphs', 'Batista flees, revolutionaries enter Havana', 'Fidel Castro''s 26th of July Movement overthrew the Batista dictatorship, establishing a socialist state 90 miles from the United States.', 'revolution', 'major', 'Havana, Cuba', ARRAY['Fidel Castro', 'Che Guevara'], ARRAY['cuba', 'revolution']),

-- Organizations
(1864, 9, 28, 'First International Founded', 'International Workingmen''s Association established', 'The First International brought together trade unionists, socialists, anarchists, and republicans. Marx played a leading role in its General Council.', 'organization', 'major', 'London, England', ARRAY['Karl Marx'], ARRAY['international', 'organization']),
(1889, 7, 14, 'Second International Founded', 'Socialist parties form new international', 'Founded on the centenary of the French Revolution, the Second International united socialist parties from around the world until its collapse in 1914.', 'organization', 'major', 'Paris, France', ARRAY['Friedrich Engels'], ARRAY['international', 'organization']),
(1903, NULL, NULL, 'Bolshevik-Menshevik Split', 'Russian Social Democratic Labour Party splits', 'At the Second Congress, the party split into Bolsheviks (majority) led by Lenin and Mensheviks (minority) over questions of party organization.', 'organization', 'major', 'London, England', ARRAY['Vladimir Lenin'], ARRAY['bolshevik', 'menshevik', 'party']),
(1919, 3, 2, 'Third International Founded', 'Communist International (Comintern) established', 'Lenin founded the Comintern to promote world revolution and coordinate communist parties internationally, breaking with the "social chauvinist" Second International.', 'organization', 'major', 'Moscow, Soviet Russia', ARRAY['Vladimir Lenin'], ARRAY['comintern', 'international', 'organization']),

-- Historical/Economic Events
(1825, NULL, NULL, 'First Capitalist Crisis', 'First international economic crisis', 'The first truly international capitalist crisis began in England and spread across Europe and Latin America, demonstrating capitalism''s inherent instability.', 'economic', 'normal', 'England', ARRAY[], ARRAY['crisis', 'economics']),
(1857, NULL, NULL, 'Global Economic Crisis of 1857', 'First worldwide economic crisis', 'This crisis began in the United States and spread globally. Marx saw it as potential trigger for revolution and intensified his economic studies.', 'economic', 'normal', 'Global', ARRAY['Karl Marx'], ARRAY['crisis', 'economics']),
(1914, 7, 28, 'World War I Begins', 'The Great War erupts in Europe', 'The war marked the collapse of the Second International as most socialist parties supported their national governments. Lenin called for turning the imperialist war into civil war.', 'war', 'critical', 'Europe', ARRAY['Vladimir Lenin', 'Rosa Luxemburg'], ARRAY['war', 'imperialism']),
(1918, 11, 11, 'World War I Ends', 'Armistice signed, German Revolution begins', 'The war''s end sparked revolutionary movements across Europe, including the German Revolution that overthrew the Kaiser.', 'war', 'major', 'Europe', ARRAY['Rosa Luxemburg', 'Karl Liebknecht'], ARRAY['war', 'revolution']),
(1929, 10, 29, 'Wall Street Crash', 'Stock market crash triggers Great Depression', 'The crash marked the beginning of the worst economic crisis in capitalist history, vindicating Marxist analysis of capitalism''s contradictions.', 'economic', 'critical', 'New York, USA', ARRAY[], ARRAY['crisis', 'depression', 'economics']);
