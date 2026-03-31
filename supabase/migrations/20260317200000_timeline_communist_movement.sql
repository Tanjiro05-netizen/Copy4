-- ============================================
-- TIMELINE: COMMUNIST MOVEMENT 1872-1949
-- New events covering Second International congresses,
-- WWI/Zimmerwald, Comintern congresses, Italian Left,
-- Chinese Communist Party, and WWII milestones.
-- Skips events already present in 20250630122100.
-- ============================================

INSERT INTO timeline_events (year, month, day, title, description, detailed_description, category, importance, location, related_people, tags, wikipedia_url, image_url) VALUES

-- ============================================
-- I. FIRST INTERNATIONAL: DISSOLUTION
-- ============================================

(1872, 9, NULL, 'Hague Congress of the First International', 'General Council relocated to New York; anarchist faction expelled',
'The Hague Congress of the International Workingmen''s Association voted to transfer the General Council to New York and expelled the anarchist faction led by Mikhail Bakunin. The congress deepened the split between Marxists and anarchists over the question of political action and the role of the state.',
'organization', 'major', 'The Hague, Netherlands',
ARRAY['Karl Marx', 'Mikhail Bakunin', 'Friedrich Engels'],
ARRAY['first-international', 'hague-congress', 'anarchism', 'bakunin'],
'https://en.wikipedia.org/wiki/Hague_Congress_(1872)',
'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Karl_Marx_and_Friedrich_Engels_at_Hague_Congress.jpg/800px-Karl_Marx_and_Friedrich_Engels_at_Hague_Congress.jpg'),

(1876, 7, 15, 'First International Dissolved', 'IWA formally dissolved at Philadelphia Conference',
'The International Workingmen''s Association was formally dissolved at the Philadelphia Conference. With the General Council relocated to New York and the European sections weakened, the First International had ceased to function as an effective organization.',
'organization', 'major', 'Philadelphia, USA',
ARRAY['Karl Marx', 'Friedrich Engels'],
ARRAY['first-international', 'dissolution', 'philadelphia'],
'https://en.wikipedia.org/wiki/International_Workingmen%27s_Association',
NULL),

-- ============================================
-- II. SECOND INTERNATIONAL CONGRESSES
-- ============================================

(1891, 8, 3, 'Second International Brussels Congress', 'Resolution on political action adopted',
'The Brussels Congress of the Second International adopted a resolution affirming the necessity of political action by the working class, marking a further consolidation of parliamentary socialist strategy across Europe.',
'organization', 'normal', 'Brussels, Belgium',
ARRAY['Friedrich Engels'],
ARRAY['second-international', 'brussels', 'political-action'],
'https://en.wikipedia.org/wiki/Second_International',
NULL),

(1893, 8, 9, 'Second International Zurich Congress', 'Resolution excluding anarchists adopted',
'The Zurich Congress of the Second International adopted a resolution formally excluding anarchists from participation, cementing the organization''s commitment to political party organization and parliamentary action.',
'organization', 'normal', 'Zurich, Switzerland',
ARRAY['Friedrich Engels'],
ARRAY['second-international', 'zurich', 'anarchism'],
'https://en.wikipedia.org/wiki/Second_International',
NULL),

(1904, 8, 14, 'Second International Amsterdam Congress', 'Debate on ministerialism and class collaboration',
'The Amsterdam Congress featured a major debate on ministerialism — whether socialists should participate in bourgeois governments. The congress adopted a resolution against socialist participation in capitalist ministries, directed particularly against the French case of Alexandre Millerand.',
'organization', 'normal', 'Amsterdam, Netherlands',
ARRAY['Jean Jaurès', 'August Bebel'],
ARRAY['second-international', 'amsterdam', 'ministerialism'],
'https://en.wikipedia.org/wiki/Second_International',
NULL),

(1907, 8, 18, 'Second International Stuttgart Congress', 'Anti-militarism resolution adopted',
'The Stuttgart Congress adopted an anti-militarism resolution declaring war an inherent part of capitalism and calling on socialists to utilize any war crisis to hasten the overthrow of bourgeois rule. Rosa Luxemburg and Lenin successfully amended the resolution to include this revolutionary clause.',
'organization', 'major', 'Stuttgart, Germany',
ARRAY['Rosa Luxemburg', 'Vladimir Lenin', 'August Bebel'],
ARRAY['second-international', 'stuttgart', 'anti-militarism', 'war'],
'https://en.wikipedia.org/wiki/International_Socialist_Congress,_Stuttgart_1907',
'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Internationale_Sozialisten-Kongre%C3%9F_Stuttgart_1907.jpg/1024px-Internationale_Sozialisten-Kongre%C3%9F_Stuttgart_1907.jpg'),

(1910, 8, 28, 'Second International Copenhagen Congress', 'International Women''s Day proposed',
'The Copenhagen Congress of the Second International continued debates on disarmament and anti-war strategy. Clara Zetkin proposed the establishment of an International Women''s Day, which was adopted by the congress.',
'organization', 'normal', 'Copenhagen, Denmark',
ARRAY['Clara Zetkin'],
ARRAY['second-international', 'copenhagen', 'womens-day'],
'https://en.wikipedia.org/wiki/Eighth_International_Socialist_Congress',
NULL),

(1912, 11, 24, 'Second International Basel Extraordinary Congress', 'Manifesto against imperialist war issued',
'Convened as an emergency congress in response to the Balkan Wars and the growing threat of a general European war. The Basel Manifesto declared the determination of the international proletariat to prevent war by all means and to use any conflict to accelerate the fall of capitalism.',
'organization', 'major', 'Basel, Switzerland',
ARRAY['Jean Jaurès', 'Rosa Luxemburg'],
ARRAY['second-international', 'basel', 'anti-war', 'manifesto'],
'https://en.wikipedia.org/wiki/Extraordinary_International_Socialist_Congress',
'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Basel_Congress_1912.jpg/1024px-Basel_Congress_1912.jpg'),

-- ============================================
-- III. ITALIAN SOCIALIST PARTY CONGRESSES
-- ============================================

(1912, NULL, NULL, 'PSI Reggio Emilia Congress', 'Intransigent Revolutionary Fraction formed within Italian Socialist Party',
'At the Reggio Emilia Congress of the Italian Socialist Party, the Intransigent Revolutionary Fraction was established as an organized tendency opposed to reformism and parliamentary collaboration. This current represented the earliest organized left opposition within the PSI.',
'organization', 'normal', 'Reggio Emilia, Italy',
ARRAY['Amadeo Bordiga', 'Benito Mussolini'],
ARRAY['psi', 'italy', 'intransigent-fraction'],
'https://en.wikipedia.org/wiki/Italian_Socialist_Party',
NULL),

(1913, NULL, NULL, 'PSI Milan Congress', 'Left tendency opposes parliamentary alliances',
'At the Milan Congress of the Italian Socialist Party, the left tendency led by Lazzaro and Mussolini opposed parliamentary alliances with bourgeois parties, continuing the factional struggle between reformists and revolutionaries within Italian socialism.',
'organization', 'normal', 'Milan, Italy',
ARRAY['Amadeo Bordiga'],
ARRAY['psi', 'milan', 'italy', 'anti-parliamentarism'],
'https://en.wikipedia.org/wiki/Italian_Socialist_Party',
NULL),

-- ============================================
-- IV. WORLD WAR I AND ZIMMERWALD MOVEMENT
-- ============================================

(1914, 7, 28, 'World War I Begins', 'Austria-Hungary declares war on Serbia',
'The assassination of Archduke Franz Ferdinand on June 28 triggered a chain of alliance obligations that plunged Europe into the most devastating war in history to that point. The conflict would kill over 17 million people and destroy four empires.',
'war', 'critical', 'Europe',
ARRAY[]::TEXT[],
ARRAY['world-war-i', 'imperialism', 'militarism'],
'https://en.wikipedia.org/wiki/World_War_I',
'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/WWImontage.jpg/800px-WWImontage.jpg'),

(1916, 4, 24, 'Kienthal Conference', 'Anti-war manifesto adopted by internationalists',
'The second conference of the Zimmerwald movement, held in Kienthal, Switzerland, produced a more militant manifesto than Zimmerwald, explicitly calling on socialist deputies to vote against war credits and break with national unity governments. The conference demonstrated growing radicalization within the anti-war movement.',
'organization', 'major', 'Kienthal, Switzerland',
ARRAY['Vladimir Lenin', 'Robert Grimm'],
ARRAY['kienthal', 'zimmerwald', 'anti-war', 'internationalism'],
'https://en.wikipedia.org/wiki/Kienthal_Conference',
'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Seconda_conferenza_internazionale_socialista_di_zimmerwald_svoltasi_a_Kienthal.jpg/1024px-Seconda_conferenza_internazionale_socialista_di_zimmerwald_svoltasi_a_Kienthal.jpg'),

-- ============================================
-- V. RUSSIAN REVOLUTION SUPPLEMENTARY EVENTS
-- ============================================

(1917, 7, 16, 'July Days Uprising', 'Spontaneous armed demonstrations in Petrograd',
'Soldiers and workers staged spontaneous armed demonstrations demanding "All Power to the Soviets." The Provisional Government suppressed the uprising, and the Bolshevik leadership was accused of instigating it. Lenin went into hiding in Finland.',
'revolution', 'major', 'Petrograd, Russia',
ARRAY['Vladimir Lenin'],
ARRAY['july-days', '1917', 'petrograd', 'soviets'],
'https://en.wikipedia.org/wiki/July_Days',
'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/19170704_Riot_on_Nevsky_prosp_Petrograd.jpg/1024px-19170704_Riot_on_Nevsky_prosp_Petrograd.jpg'),

(1917, 11, 8, 'Decree on Peace', 'Bolshevik government calls for immediate armistice',
'The Decree on Peace, issued by the new Bolshevik government, called upon all belligerent nations to begin immediate negotiations for a just and democratic peace without annexations or indemnities. It was the first act of the Soviet government.',
'historical', 'major', 'Petrograd, Russia',
ARRAY['Vladimir Lenin'],
ARRAY['decree-on-peace', '1917', 'bolshevik', 'armistice'],
'https://en.wikipedia.org/wiki/Decree_on_Peace',
NULL),

(1918, 1, 5, 'Constituent Assembly Dissolved', 'Bolsheviks dissolve the elected assembly after one session',
'The All-Russian Constituent Assembly, elected in November 1917, met for a single session on January 5-6, 1918. The Bolsheviks, having received only 24% of the vote, dissolved the assembly, asserting the superiority of soviet democracy over bourgeois parliamentarism.',
'historical', 'major', 'Petrograd, Russia',
ARRAY['Vladimir Lenin'],
ARRAY['constituent-assembly', '1918', 'bolshevik', 'parliament'],
'https://en.wikipedia.org/wiki/Russian_Constituent_Assembly',
'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Tauride_Palace%2C_Petrograd%2C_1917.jpg/1024px-Tauride_Palace%2C_Petrograd%2C_1917.jpg'),

(1918, 11, 11, 'World War I Armistice', 'Hostilities cease on the Western Front',
'The armistice signed in a railway carriage at Compiègne ended hostilities on the Western Front. The war had killed over 17 million people and left the old European order in ruins, creating the conditions for revolutionary upheaval across the continent.',
'war', 'critical', 'Compiègne, France',
ARRAY[]::TEXT[],
ARRAY['world-war-i', 'armistice', 'compiegne'],
'https://en.wikipedia.org/wiki/Armistice_of_11_November_1918',
'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Armisticetrain.jpg/1024px-Armisticetrain.jpg'),

-- ============================================
-- VI. COMINTERN AND ITALIAN LEFT (1919-1926)
-- ============================================

(1919, NULL, NULL, 'Bologna Congress — Abstentionist Fraction Formed', 'Bordiga leads abstentionist communist faction within PSI',
'At the Bologna Congress of the Italian Socialist Party, Amadeo Bordiga formed the Abstentionist Communist Fraction, advocating a boycott of bourgeois parliamentary elections and demanding the PSI align itself with the newly founded Communist International.',
'organization', 'major', 'Bologna, Italy',
ARRAY['Amadeo Bordiga'],
ARRAY['psi', 'bologna', 'bordiga', 'abstentionism'],
'https://en.wikipedia.org/wiki/Amadeo_Bordiga',
NULL),

(1919, 5, 4, 'May Fourth Movement', 'Student demonstrations erupt across China',
'Students in Beijing demonstrated against the Treaty of Versailles, which transferred German concessions in Shandong to Japan. The movement spread nationwide and catalyzed a broad intellectual and political awakening, creating the conditions for the spread of Marxism in China.',
'revolution', 'major', 'Beijing, China',
ARRAY['Chen Duxiu', 'Li Dazhao'],
ARRAY['may-fourth', 'china', 'anti-imperialism', 'students'],
'https://en.wikipedia.org/wiki/May_Fourth_Movement',
'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/4_May_1919_in_Beijing.jpg/1024px-4_May_1919_in_Beijing.jpg'),

(1920, NULL, NULL, 'Communist Groups Established Across China', 'Marxist study circles form in major Chinese cities',
'Communist groups were established in Shanghai, Beijing, Wuhan, Changsha, Guangzhou, and among Chinese students in Japan and France. These study circles, influenced by the October Revolution and the May Fourth Movement, formed the organizational basis for the founding of the Chinese Communist Party.',
'organization', 'normal', 'China',
ARRAY['Chen Duxiu', 'Li Dazhao', 'Mao Zedong'],
ARRAY['china', 'marxism', 'study-circles', 'cpc-founding'],
'https://en.wikipedia.org/wiki/Chinese_Communist_Party',
NULL),

(1920, 11, 28, 'Imola Conference of the Italian Left', 'Unified Communist Fraction formed',
'At the Imola Conference, Bordiga''s Abstentionist Fraction merged with other left currents within the PSI to form the Unified Communist Fraction, preparing the ground for the founding of the Communist Party of Italy at Livorno two months later.',
'organization', 'major', 'Imola, Italy',
ARRAY['Amadeo Bordiga'],
ARRAY['imola', 'italy', 'communist-fraction', 'pcdi'],
'https://en.wikipedia.org/wiki/Amadeo_Bordiga',
NULL),

(1921, 7, 23, 'First National Congress of Chinese Communist Party', 'CPC founded in Shanghai with 13 delegates',
'The founding congress of the Chinese Communist Party was held secretly in the French Concession of Shanghai, later moving to a boat on South Lake in Jiaxing to avoid police detection. Thirteen delegates represented approximately 57 party members from across China.',
'organization', 'critical', 'Shanghai/Jiaxing, China',
ARRAY['Mao Zedong', 'Chen Duxiu', 'Li Dazhao'],
ARRAY['cpc', 'founding', 'shanghai', 'first-congress'],
'https://en.wikipedia.org/wiki/1st_National_Congress_of_the_Chinese_Communist_Party',
'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Site_of_the_First_National_Congress_of_the_Chinese_Communist_Party.jpg/1024px-Site_of_the_First_National_Congress_of_the_Chinese_Communist_Party.jpg'),

(1921, 6, 22, 'Third Congress of Comintern', '"To the masses!" tactic adopted',
'The Third Congress repudiated the failed "theory of the offensive" exemplified by the disastrous German "March Action" and adopted the watchword "To the masses!" emphasizing the need for communist parties to win the confidence of the working class before attempting revolutionary action.',
'organization', 'major', 'Moscow, Soviet Russia',
ARRAY['Vladimir Lenin', 'Leon Trotsky'],
ARRAY['comintern', 'third-congress', 'to-the-masses', 'united-front'],
'https://en.wikipedia.org/wiki/3rd_World_Congress_of_the_Communist_International',
NULL),

(1921, 8, NULL, 'Secretariat of Chinese Labour Organization', 'First nationwide labor organizing body established',
'The Secretariat of the Chinese Labour Organization was established in Shanghai under CPC leadership, marking the beginning of systematic communist-led labor organizing in China.',
'organization', 'normal', 'Shanghai, China',
ARRAY['Zhang Guotao'],
ARRAY['china', 'labor', 'shanghai', 'workers'],
'https://en.wikipedia.org/wiki/Chinese_Communist_Party',
NULL),

(1922, 1, 12, 'Hong Kong Seamen''s Strike', 'Major strike by Chinese maritime workers',
'Chinese seamen in Hong Kong launched a major strike demanding wage increases. The strike, which lasted until March, demonstrated the growing militancy of the Chinese working class and the influence of the nascent communist movement on labor organizing.',
'revolution', 'normal', 'Hong Kong, China',
ARRAY[]::TEXT[],
ARRAY['hong-kong', 'seamen', 'strike', 'china', 'labor'],
'https://en.wikipedia.org/wiki/Hong_Kong_seamen%27s_strike_of_1922',
NULL),

(1922, 5, 1, 'First National Labour Conference', 'Chinese labor movement coordinates nationally',
'The First National Labour Conference, held in Guangzhou, brought together delegates from trade unions across China. It marked the first attempt to coordinate the Chinese labor movement on a national scale under communist influence.',
'organization', 'normal', 'Guangzhou, China',
ARRAY[]::TEXT[],
ARRAY['china', 'labor', 'guangzhou', 'trade-unions'],
'https://en.wikipedia.org/wiki/Chinese_Communist_Party',
NULL),

(1922, 5, 5, 'First Congress of Chinese Socialist Youth League', 'Youth wing of communist movement established',
'The First Congress of the Chinese Socialist Youth League was held in Guangzhou, establishing the organizational framework for recruiting young people into the communist movement in China.',
'organization', 'normal', 'Guangzhou, China',
ARRAY[]::TEXT[],
ARRAY['china', 'youth-league', 'guangzhou'],
'https://en.wikipedia.org/wiki/Communist_Youth_League_of_China',
NULL),

(1922, 7, 16, 'Second National Congress of CPC', 'Minimum and maximum programmes adopted',
'The Second National Congress of the CPC, held in Shanghai, adopted a programme distinguishing between minimum objectives (anti-imperialism, anti-feudalism, democratic republic) and maximum objectives (socialism and communism). The congress formally voted to join the Comintern.',
'organization', 'major', 'Shanghai, China',
ARRAY['Chen Duxiu'],
ARRAY['cpc', 'second-congress', 'shanghai', 'programme'],
'https://en.wikipedia.org/wiki/2nd_National_Congress_of_the_Chinese_Communist_Party',
NULL),

(1922, 11, 5, 'Fourth Congress of Comintern', 'United Front tactic formally adopted',
'The Fourth Congress formally adopted the United Front tactic, intended to win back workers under the influence of reformist parties by proposing joint action on immediate demands. Bordiga presented a report on fascism in Italy, analyzing its class character and warning of its spread.',
'organization', 'major', 'Moscow, Soviet Russia',
ARRAY['Vladimir Lenin', 'Amadeo Bordiga', 'Leon Trotsky'],
ARRAY['comintern', 'fourth-congress', 'united-front', 'fascism'],
'https://en.wikipedia.org/wiki/4th_World_Congress_of_the_Communist_International',
NULL),

(1923, 6, 12, 'Third National Congress of CPC', 'Decision to cooperate with Kuomintang adopted',
'The Third National Congress, held in Guangzhou, adopted the decision for CPC members to join the Kuomintang as individuals, forming a united front against imperialism and warlordism. This "bloc within" strategy was directed by the Comintern.',
'organization', 'major', 'Guangzhou, China',
ARRAY['Chen Duxiu', 'Mao Zedong'],
ARRAY['cpc', 'third-congress', 'guangzhou', 'kuomintang', 'united-front'],
'https://en.wikipedia.org/wiki/3rd_National_Congress_of_the_Chinese_Communist_Party',
NULL),

(1924, 5, NULL, 'Como Conference of PCd''I', 'Italian Left faction wins majority on party direction',
'At the Como Conference of the Communist Party of Italy, the Left faction led by Bordiga won a majority on questions of party direction, demonstrating continued support for the Italian Left''s positions within the party despite Comintern pressure.',
'organization', 'normal', 'Como, Italy',
ARRAY['Amadeo Bordiga'],
ARRAY['pcdi', 'como', 'italian-left', 'bordiga'],
'https://en.wikipedia.org/wiki/Amadeo_Bordiga',
NULL),

(1924, 6, 17, 'Fifth Congress of Comintern', '"Bolshevisation" policy adopted',
'The Fifth Congress adopted the policy of "Bolshevisation," requiring all member parties to reorganize on the basis of factory cells rather than territorial sections. This policy aimed to make parties more disciplined but was criticized by the Italian Left as a bureaucratic imposition that severed parties from their organic traditions.',
'organization', 'major', 'Moscow, Soviet Union',
ARRAY['Grigory Zinoviev', 'Amadeo Bordiga'],
ARRAY['comintern', 'fifth-congress', 'bolshevisation'],
'https://en.wikipedia.org/wiki/5th_World_Congress_of_the_Communist_International',
NULL),

(1925, 1, NULL, 'Trotsky Removed as Military Commissar', 'Trotsky loses his institutional base',
'Leon Trotsky was removed from his post as People''s Commissar for Military and Naval Affairs, losing his primary institutional base of power. This marked a decisive moment in the internal party struggle following Lenin''s death.',
'historical', 'major', 'Moscow, Soviet Union',
ARRAY['Leon Trotsky', 'Joseph Stalin'],
ARRAY['trotsky', 'stalin', 'power-struggle', 'left-opposition'],
'https://en.wikipedia.org/wiki/Leon_Trotsky',
'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Trotsky_Portrait.jpg/800px-Trotsky_Portrait.jpg'),

(1925, 3, NULL, 'ECCI Orders Elimination of Bordiga Tendency', 'Comintern moves to suppress Italian Left',
'The Enlarged Executive of the Communist International ordered the elimination of the Bordiga tendency within the Communist Party of Italy, pressuring the party leadership to marginalize the Italian Left faction that had founded the party.',
'organization', 'major', 'Moscow, Soviet Union',
ARRAY['Amadeo Bordiga', 'Grigory Zinoviev'],
ARRAY['comintern', 'ecci', 'bordiga', 'italian-left'],
'https://en.wikipedia.org/wiki/Amadeo_Bordiga',
NULL),

(1925, 4, NULL, 'Committee of Intesa Formed', 'Italian Left organizes internal opposition',
'The Committee of Intesa was formed by the Italian Left as an internal opposition body within the Communist Party of Italy, coordinating resistance to the Comintern''s bolshevisation directives and the transfer of party leadership away from Bordiga''s faction.',
'organization', 'normal', 'Italy',
ARRAY['Amadeo Bordiga'],
ARRAY['committee-of-intesa', 'italian-left', 'pcdi', 'opposition'],
'https://en.wikipedia.org/wiki/Amadeo_Bordiga',
NULL),

(1926, 1, 20, 'Lyon Congress of PCd''I', 'Leadership transferred to Gramsci-Togliatti',
'At the Lyon Congress of the Communist Party of Italy, the Italian Left presented its theses but was defeated. Party leadership was transferred from Bordiga''s faction to the centre group led by Antonio Gramsci and Palmiro Togliatti, in line with Comintern directives.',
'organization', 'major', 'Lyon, France',
ARRAY['Amadeo Bordiga', 'Antonio Gramsci', 'Palmiro Togliatti'],
ARRAY['pcdi', 'lyon-congress', 'gramsci', 'togliatti', 'italian-left'],
'https://en.wikipedia.org/wiki/III_Congress_of_the_Communist_Party_of_Italy',
NULL),

(1926, NULL, NULL, 'Bordiga''s Lyons Theses', 'Formal articulation of the Italian Left position',
'Bordiga submitted his "Lyons Theses" to the Comintern, constituting the most comprehensive formal articulation of the Italian Left Communist position on party organization, the nature of the revolutionary process, and the relationship between the national parties and the International.',
'publication', 'major', 'Italy',
ARRAY['Amadeo Bordiga'],
ARRAY['lyons-theses', 'italian-left', 'bordiga', 'party-theory'],
'https://en.wikipedia.org/wiki/Amadeo_Bordiga',
NULL),

(1926, 11, NULL, 'Seventh Enlarged Plenum of ECCI', 'Stalin presents "Socialism in One Country"',
'The Seventh Enlarged Plenum of the Executive Committee of the Communist International saw Stalin formally present the thesis of "Socialism in One Country," marking a decisive break with the internationalist orientation of the early Comintern. The PCd''I delegation was expelled from Comintern leadership structures.',
'organization', 'critical', 'Moscow, Soviet Union',
ARRAY['Joseph Stalin', 'Amadeo Bordiga'],
ARRAY['ecci', 'socialism-in-one-country', 'stalin', 'comintern'],
'https://en.wikipedia.org/wiki/Socialism_in_one_country',
NULL),

-- ============================================
-- VII. CHINESE REVOLUTION: UNITED FRONT COLLAPSE
-- ============================================

(1927, 7, 15, 'Wuhan KMT Expels Communists', 'First United Front collapses completely',
'The Wuhan faction of the Kuomintang government formally expelled all communists, completing the collapse of the First United Front that had begun with Chiang Kai-shek''s Shanghai purge in April. The CPC was driven underground and into the countryside.',
'historical', 'critical', 'Wuhan, China',
ARRAY['Wang Jingwei'],
ARRAY['china', 'kuomintang', 'united-front', 'wuhan', 'purge'],
'https://en.wikipedia.org/wiki/Chinese_Communist_Party',
NULL),

(1927, 8, 1, 'Nanchang Uprising', 'Beginning of CPC armed struggle',
'CPC forces under Zhou Enlai, He Long, and Zhu De launched an armed uprising in Nanchang, Jiangxi province. Though the rebels were forced to retreat within days, the event is celebrated as the founding of the Chinese Red Army. August 1 remains PRC Army Day.',
'revolution', 'critical', 'Nanchang, China',
ARRAY['Zhou Enlai', 'He Long', 'Zhu De'],
ARRAY['nanchang', 'uprising', 'red-army', 'china', 'armed-struggle'],
'https://en.wikipedia.org/wiki/Nanchang_uprising',
'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Monument_to_the_August_1st_Nanchang_Uprising_1.jpg/800px-Monument_to_the_August_1st_Nanchang_Uprising_1.jpg'),

(1927, 8, 7, 'Emergency Conference of CPC', 'Mao advocates armed agrarian revolution',
'The Emergency Conference of the CPC Central Committee, held secretly in Hankou, adopted a new line of armed insurrection and agrarian revolution. Mao Zedong argued for mobilizing the peasantry as the main force of the Chinese revolution.',
'organization', 'major', 'Hankou, China',
ARRAY['Mao Zedong', 'Qu Qiubai'],
ARRAY['cpc', 'emergency-conference', 'agrarian-revolution', 'mao'],
'https://en.wikipedia.org/wiki/August_7_Emergency_Meeting',
NULL),

(1927, 9, NULL, 'Autumn Harvest Uprisings', 'Mao leads peasant insurrections in Hunan',
'Mao Zedong led the Autumn Harvest Uprisings in Hunan province. After the failure of the initial military actions, Mao led the surviving forces to the Jinggang Mountains, establishing the first rural revolutionary base area and pioneering the strategy of peasant guerrilla warfare.',
'revolution', 'major', 'Hunan, China',
ARRAY['Mao Zedong'],
ARRAY['autumn-harvest', 'hunan', 'peasant-revolution', 'jinggang'],
'https://en.wikipedia.org/wiki/Autumn_Harvest_Uprising',
NULL),

(1927, NULL, NULL, 'Italian Left Fraction Formed in Exile', 'Left Fraction of Communist Party of Italy established',
'Members of the Italian Communist Left in emigration formed the Left Fraction of the Communist Party of Italy in Pantin, France. The fraction continued to uphold the positions of the Italian Left against the increasingly Stalinized Comintern, publishing theoretical journals and maintaining organizational continuity.',
'organization', 'major', 'Pantin, France',
ARRAY['Amadeo Bordiga'],
ARRAY['italian-left', 'left-fraction', 'exile', 'pantin'],
'https://en.wikipedia.org/wiki/Italian_Communist_Left',
NULL),

-- ============================================
-- VIII. THIRD PERIOD AND COMINTERN SHIFTS
-- ============================================

(1928, 6, 18, 'Sixth Congress of Comintern', '"Third Period" and social-fascism thesis adopted',
'The Sixth Congress adopted the "Third Period" theory, which predicted an imminent revolutionary crisis and characterized social-democratic parties as "social-fascist" — the main enemy of the working class. This ultra-left line would prove catastrophic in Germany, where it prevented a united front against Nazism.',
'organization', 'major', 'Moscow, Soviet Union',
ARRAY['Nikolai Bukharin', 'Joseph Stalin'],
ARRAY['comintern', 'sixth-congress', 'third-period', 'social-fascism'],
'https://en.wikipedia.org/wiki/6th_World_Congress_of_the_Communist_International',
NULL),

(1928, 7, NULL, 'Sixth National Congress of CPC', 'Peasant-based strategy endorsed',
'The Sixth National Congress of the CPC, held in Moscow under Comintern supervision, endorsed a peasant-based revolutionary strategy while formally maintaining the leading role of the proletariat. The congress was the only CPC national congress held outside China.',
'organization', 'major', 'Moscow, Soviet Union',
ARRAY['Qu Qiubai', 'Zhou Enlai'],
ARRAY['cpc', 'sixth-congress', 'moscow', 'peasant-strategy'],
'https://en.wikipedia.org/wiki/6th_National_Congress_of_the_Chinese_Communist_Party',
NULL),

(1931, 3, NULL, 'Eleventh Plenum of ECCI', '"Class against class" line reinforced',
'The Eleventh Plenum of the Executive Committee of the Communist International reinforced the "class against class" line, deepening the sectarian orientation that isolated communist parties from potential allies against fascism.',
'organization', 'normal', 'Moscow, Soviet Union',
ARRAY[]::TEXT[],
ARRAY['ecci', 'class-against-class', 'comintern', 'sectarianism'],
'https://en.wikipedia.org/wiki/Communist_International',
NULL),

(1933, 12, NULL, 'Thirteenth Plenum of ECCI', 'Analysis of fascism as product of capitalist crisis',
'The Thirteenth Plenum of the ECCI produced an analysis of fascism as the "open terrorist dictatorship of the most reactionary, most chauvinistic and most imperialist elements of finance capital," a formulation that would be refined at the Seventh Congress.',
'organization', 'normal', 'Moscow, Soviet Union',
ARRAY[]::TEXT[],
ARRAY['ecci', 'fascism', 'comintern', 'analysis'],
'https://en.wikipedia.org/wiki/Communist_International',
NULL),

-- ============================================
-- IX. LONG MARCH AND CHINESE REVOLUTION
-- ============================================

(1934, 10, NULL, 'Long March Begins', 'Red Army retreats from Jiangxi Soviet base',
'Facing encirclement by Nationalist forces in the Fifth Encirclement Campaign, approximately 86,000 soldiers of the Chinese Red Army broke through the blockade and began the Long March from Jiangxi. The march would cover roughly 9,000 kilometers over one year.',
'war', 'critical', 'Jiangxi, China',
ARRAY['Mao Zedong', 'Zhou Enlai', 'Zhu De'],
ARRAY['long-march', 'red-army', 'jiangxi', 'retreat'],
'https://en.wikipedia.org/wiki/Long_March',
'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Map_of_the_Long_March_1934-1935-en.svg/1024px-Map_of_the_Long_March_1934-1935-en.svg.png'),

(1935, 1, NULL, 'Zunyi Conference', 'Mao Zedong gains leadership of military affairs',
'The Zunyi Conference of the CPC Politburo, held during the Long March, marked a turning point in party history. Mao Zedong gained effective control of military decision-making, displacing the Comintern-backed leadership that had led to the disastrous Fifth Encirclement Campaign defeats.',
'organization', 'critical', 'Zunyi, China',
ARRAY['Mao Zedong', 'Zhou Enlai', 'Wang Jiaxiang'],
ARRAY['zunyi', 'long-march', 'mao', 'leadership', 'turning-point'],
'https://en.wikipedia.org/wiki/Zunyi_Conference',
'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Zunyi_Conference_Site.jpg/1024px-Zunyi_Conference_Site.jpg'),

(1935, 7, 25, 'Seventh Congress of Comintern', 'Popular Front policy adopted',
'The Seventh and final regular congress of the Communist International adopted the Popular Front policy, endorsing alliances with bourgeois democratic parties and governments to combat fascism. Georgi Dimitrov presented the main report. This represented a dramatic reversal of the Third Period line.',
'organization', 'major', 'Moscow, Soviet Union',
ARRAY['Georgi Dimitrov', 'Joseph Stalin'],
ARRAY['comintern', 'seventh-congress', 'popular-front', 'anti-fascism'],
'https://en.wikipedia.org/wiki/7th_World_Congress_of_the_Comintern',
NULL),

(1935, 10, NULL, 'Long March Concludes', 'Red Army arrives in Yan''an',
'The surviving forces of the Long March arrived in Yan''an, Shaanxi province. Of the roughly 86,000 who began the march, only about 8,000 completed it. Yan''an would serve as the CPC''s base of operations for the next decade.',
'historical', 'major', 'Yan''an, China',
ARRAY['Mao Zedong'],
ARRAY['long-march', 'yanan', 'red-army', 'base-area'],
'https://en.wikipedia.org/wiki/Long_March',
NULL),

(1936, 2, NULL, 'CPC Declaration on Resisting Japan', 'Call for national united front against Japanese aggression',
'The CPC issued its "Declaration on Resisting Japan and Saving the Nation," calling for a broad national united front of all Chinese forces against Japanese imperial aggression, signaling a strategic shift from class war to national defense.',
'publication', 'normal', 'Yan''an, China',
ARRAY['Mao Zedong'],
ARRAY['china', 'anti-japan', 'united-front', 'declaration'],
'https://en.wikipedia.org/wiki/Chinese_Communist_Party',
NULL),

(1936, 12, 12, 'Xi''an Incident', 'Chiang Kai-shek detained; Second United Front negotiations begin',
'Zhang Xueliang and Yang Hucheng detained Chiang Kai-shek in Xi''an, demanding an end to the civil war against the communists and the formation of a united front against Japan. Zhou Enlai negotiated on behalf of the CPC. Chiang was released after agreeing to cooperate.',
'historical', 'critical', 'Xi''an, China',
ARRAY['Chiang Kai-shek', 'Zhang Xueliang', 'Zhou Enlai'],
ARRAY['xian-incident', 'china', 'united-front', 'kidnapping'],
'https://en.wikipedia.org/wiki/Xi%27an_Incident',
'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Zhang_Xueliang%2C_Yang_Hucheng_and_Chiang_Kai-shek.jpg/800px-Zhang_Xueliang%2C_Yang_Hucheng_and_Chiang_Kai-shek.jpg'),

-- ============================================
-- X. SINO-JAPANESE WAR
-- ============================================

(1937, 7, 7, 'Marco Polo Bridge Incident', 'Full-scale Sino-Japanese War begins',
'A skirmish between Chinese and Japanese troops at the Marco Polo Bridge (Lugou Bridge) near Beijing escalated into full-scale war. The incident marked the beginning of the Second Sino-Japanese War, which would merge into World War II.',
'war', 'critical', 'Beijing, China',
ARRAY[]::TEXT[],
ARRAY['marco-polo-bridge', 'sino-japanese-war', 'china', 'japan'],
'https://en.wikipedia.org/wiki/Marco_Polo_Bridge_Incident',
'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Lugou_Bridge_in_1937.jpg/1024px-Lugou_Bridge_in_1937.jpg'),

(1937, 9, 22, 'Second United Front Formally Announced', 'KMT-CPC cooperation against Japan',
'The Kuomintang and Chinese Communist Party formally announced the Second United Front, pledging cooperation against Japanese aggression. The Red Army was reorganized as the Eighth Route Army under nominal Nationalist command.',
'organization', 'major', 'China',
ARRAY['Chiang Kai-shek', 'Mao Zedong', 'Zhou Enlai'],
ARRAY['second-united-front', 'china', 'kuomintang', 'anti-japan'],
'https://en.wikipedia.org/wiki/Second_United_Front_(China)',
NULL),

(1937, 12, 13, 'Nanjing Captured by Japanese Forces', 'Nanjing Massacre begins',
'Japanese forces captured Nanjing, the capital of the Republic of China. In the weeks that followed, Japanese troops carried out mass killings, rape, and destruction against Chinese civilians and disarmed soldiers. Estimates of those killed range from tens of thousands to over 300,000.',
'war', 'critical', 'Nanjing, China',
ARRAY[]::TEXT[],
ARRAY['nanjing-massacre', 'sino-japanese-war', 'china', 'war-crimes'],
'https://en.wikipedia.org/wiki/Nanjing_Massacre',
'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Nanking_bodies_1937.jpg/1024px-Nanking_bodies_1937.jpg'),

(1938, 9, 29, 'Sixth Plenary Session of CPC Central Committee', 'Mao''s leadership consolidated',
'The Sixth Plenary Session of the Sixth CPC Central Committee, held in Yan''an, consolidated Mao Zedong''s leadership over the party. Mao presented his report on "The New Stage," calling for the "sinification of Marxism" and adapting communist theory to Chinese conditions.',
'organization', 'major', 'Yan''an, China',
ARRAY['Mao Zedong'],
ARRAY['cpc', 'sixth-plenum', 'mao', 'sinification', 'yanan'],
'https://en.wikipedia.org/wiki/Chinese_Communist_Party',
NULL),

-- ============================================
-- XI. WORLD WAR II
-- ============================================

(1939, 9, 1, 'World War II Begins in Europe', 'Germany invades Poland',
'Nazi Germany invaded Poland, triggering declarations of war by Britain and France. The conflict would engulf the entire globe and kill an estimated 70-85 million people, fundamentally reshaping the world order.',
'war', 'critical', 'Poland',
ARRAY['Adolf Hitler'],
ARRAY['world-war-ii', 'poland', 'invasion', 'germany'],
'https://en.wikipedia.org/wiki/Invasion_of_Poland',
'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Schleswig-Holstein_firing_Westerplatte.jpg/1024px-Schleswig-Holstein_firing_Westerplatte.jpg'),

(1941, 6, 22, 'Germany Invades Soviet Union', 'Operation Barbarossa launched',
'Nazi Germany launched Operation Barbarossa, the largest military invasion in history, attacking the Soviet Union along a 2,900-kilometer front with 3.8 million troops. The invasion would become the decisive theater of World War II.',
'war', 'critical', 'Soviet Union',
ARRAY['Adolf Hitler', 'Joseph Stalin'],
ARRAY['barbarossa', 'world-war-ii', 'eastern-front', 'soviet-union'],
'https://en.wikipedia.org/wiki/Operation_Barbarossa',
'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Bundesarchiv_Bild_101I-137-1010-21A%2C_Russland%2C_brennendes_Dorf.jpg/1024px-Bundesarchiv_Bild_101I-137-1010-21A%2C_Russland%2C_brennendes_Dorf.jpg'),

(1941, 12, 7, 'Japan Attacks Pearl Harbor', 'United States enters World War II',
'Japan launched a surprise attack on the US naval base at Pearl Harbor, Hawaii, destroying much of the Pacific Fleet. The attack brought the United States into World War II, transforming the conflict into a truly global war.',
'war', 'critical', 'Pearl Harbor, Hawaii',
ARRAY[]::TEXT[],
ARRAY['pearl-harbor', 'world-war-ii', 'japan', 'usa', 'pacific'],
'https://en.wikipedia.org/wiki/Attack_on_Pearl_Harbor',
'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/The_USS_Arizona_%28BB-39%29_burning_after_the_Japanese_attack_on_Pearl_Harbor_-_NARA_195617_-_Edit.jpg/1024px-The_USS_Arizona_%28BB-39%29_burning_after_the_Japanese_attack_on_Pearl_Harbor_-_NARA_195617_-_Edit.jpg'),

-- ============================================
-- XII. COMINTERN DISSOLUTION AND LEFT COMMUNIST
-- ============================================

(1942, 2, 1, 'Yan''an Rectification Movement', 'Ideological campaign within CPC begins',
'Mao Zedong launched the Yan''an Rectification Movement, a mass ideological campaign to consolidate his leadership and establish Mao Zedong Thought as the party''s guiding ideology. The movement combined study, criticism, and self-criticism to unify the party around Mao''s interpretation of Marxism.',
'organization', 'major', 'Yan''an, China',
ARRAY['Mao Zedong'],
ARRAY['yanan', 'rectification', 'mao', 'ideology', 'cpc'],
'https://en.wikipedia.org/wiki/Yan%27an_Rectification_Movement',
NULL),

(1943, 5, 22, 'Communist International Formally Dissolved', 'Comintern dissolved by resolution of ECCI',
'The Communist International was formally dissolved by resolution of the Executive Committee. Stalin proposed the dissolution ostensibly to demonstrate goodwill to the Western Allies and to allow national parties greater freedom of action. The dissolution marked the definitive end of the organizational framework of world revolution established in 1919.',
'organization', 'critical', 'Moscow, Soviet Union',
ARRAY['Joseph Stalin'],
ARRAY['comintern', 'dissolution', 'stalin', 'world-revolution'],
'https://en.wikipedia.org/wiki/Dissolution_of_the_Comintern',
NULL),

(1943, NULL, NULL, 'Internationalist Communist Party of Italy Founded', 'PCInt established by Damen and returning exiles',
'The Internationalist Communist Party of Italy (Partito Comunista Internazionalista) was founded by Onorato Damen, Bruno Maffi, and other returning exiles. The party sought to continue the tradition of the Italian Communist Left outside the Stalinist framework of the dissolved Comintern.',
'organization', 'major', 'Italy',
ARRAY['Onorato Damen', 'Bruno Maffi'],
ARRAY['pcint', 'italian-left', 'damen', 'left-communism'],
'https://en.wikipedia.org/wiki/Internationalist_Communist_Party',
NULL),

-- ============================================
-- XIII. CHINESE CIVIL WAR AND VICTORY
-- ============================================

(1945, 4, 23, 'Seventh National Congress of CPC', 'Mao Zedong Thought adopted as party guide',
'The Seventh National Congress, held in Yan''an, formally adopted Mao Zedong Thought as the guiding ideology of the Chinese Communist Party alongside Marxism-Leninism. The congress prepared the party for the final confrontation with the Kuomintang.',
'organization', 'major', 'Yan''an, China',
ARRAY['Mao Zedong', 'Liu Shaoqi', 'Zhou Enlai'],
ARRAY['cpc', 'seventh-congress', 'mao-zedong-thought', 'yanan'],
'https://en.wikipedia.org/wiki/7th_National_Congress_of_the_Chinese_Communist_Party',
NULL),

(1945, 8, 15, 'Japan Surrenders', 'World War II ends in Asia',
'Emperor Hirohito announced Japan''s unconditional surrender following the atomic bombings of Hiroshima and Nagasaki and the Soviet declaration of war against Japan. The end of the war created the conditions for the final phase of the Chinese Civil War.',
'war', 'critical', 'Tokyo, Japan',
ARRAY['Hirohito'],
ARRAY['japan-surrender', 'world-war-ii', 'atomic-bomb', 'pacific'],
'https://en.wikipedia.org/wiki/Surrender_of_Japan',
'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Instrument_of_surrender_Japan2.jpg/1024px-Instrument_of_surrender_Japan2.jpg'),

(1945, 8, 28, 'Mao Arrives in Chongqing for Negotiations', 'Peace negotiations between CPC and KMT',
'Mao Zedong flew to Chongqing for peace negotiations with Chiang Kai-shek, their first meeting since the war. Despite signing the "Double Tenth Agreement" on October 10, the negotiations failed to prevent the resumption of full-scale civil war.',
'historical', 'major', 'Chongqing, China',
ARRAY['Mao Zedong', 'Chiang Kai-shek'],
ARRAY['chongqing', 'negotiations', 'civil-war', 'china'],
'https://en.wikipedia.org/wiki/Chongqing_negotiations',
'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Mao_and_Chiang1945.jpg/800px-Mao_and_Chiang1945.jpg'),

(1946, 6, NULL, 'Full-Scale Chinese Civil War Resumes', 'CPC and KMT forces clash across China',
'Full-scale civil war resumed between the Chinese Communist Party and the Kuomintang after the breakdown of American-mediated ceasefire negotiations. Nationalist forces initially held a significant advantage in manpower and equipment.',
'war', 'major', 'China',
ARRAY['Mao Zedong', 'Chiang Kai-shek'],
ARRAY['civil-war', 'china', 'kuomintang', 'cpc'],
'https://en.wikipedia.org/wiki/Chinese_Civil_War',
NULL),

(1947, 3, NULL, 'CPC Central Committee Evacuates Yan''an', 'Mobile headquarters established',
'Facing a major Nationalist offensive, the CPC Central Committee evacuated Yan''an, their base for nearly a decade. Mao established mobile headquarters in the hills of Shaanxi, demonstrating the party''s resilience and flexibility.',
'war', 'major', 'Yan''an/Shaanxi, China',
ARRAY['Mao Zedong', 'Zhou Enlai'],
ARRAY['yanan', 'evacuation', 'civil-war', 'china'],
'https://en.wikipedia.org/wiki/Chinese_Civil_War',
NULL),

(1948, 9, NULL, 'Three Great Campaigns', 'CPC gains control of Manchuria and North China',
'The Liaoshen, Huaihai, and Pingjin campaigns (September 1948 – January 1949) were the decisive battles of the Chinese Civil War. CPC forces destroyed the main Nationalist armies, gaining control of Manchuria, the Yangtze-Huai region, and North China, including Beijing and Tianjin.',
'war', 'critical', 'Manchuria/North China',
ARRAY['Mao Zedong', 'Lin Biao', 'Chen Yi', 'Deng Xiaoping'],
ARRAY['three-campaigns', 'liaoshen', 'huaihai', 'pingjin', 'civil-war'],
'https://en.wikipedia.org/wiki/Chinese_Civil_War',
'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Pingjin_Campaign.jpg/1024px-Pingjin_Campaign.jpg'),

(1949, 1, 31, 'Beijing Captured by CPC Forces', 'Former imperial capital taken without major battle',
'CPC forces entered Beijing (then Beiping) with minimal resistance after the peaceful surrender of the Nationalist garrison commander Fu Zuoyi. The capture of the historic capital was a powerful symbolic victory for the communist movement.',
'war', 'major', 'Beijing, China',
ARRAY['Lin Biao', 'Fu Zuoyi'],
ARRAY['beijing', 'capture', 'civil-war', 'china'],
'https://en.wikipedia.org/wiki/Pingjin_campaign',
NULL),

(1949, 4, 21, 'CPC Forces Cross the Yangtze', 'Nanjing captured; Nationalist capital falls',
'CPC forces crossed the Yangtze River along a broad front, breaking through the Nationalist defensive line. Nanjing, the Nationalist capital, was captured on April 23. The crossing of the Yangtze marked the effective end of Nationalist resistance on the mainland.',
'war', 'critical', 'Nanjing, China',
ARRAY['Mao Zedong'],
ARRAY['yangtze-crossing', 'nanjing', 'civil-war', 'china'],
'https://en.wikipedia.org/wiki/Yangtze_River_Crossing_campaign',
'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Occupy_the_Presidential_Palace.jpg/1024px-Occupy_the_Presidential_Palace.jpg'),

(1949, 9, 21, 'Chinese People''s Political Consultative Conference', 'New state framework established',
'The CPPCC convened in Beijing with delegates from the CPC, democratic parties, mass organizations, and independent figures. The conference adopted the Common Programme as a provisional constitution and established the political framework for the People''s Republic.',
'organization', 'major', 'Beijing, China',
ARRAY['Mao Zedong', 'Zhou Enlai'],
ARRAY['cppcc', 'china', 'common-programme', 'prc'],
'https://en.wikipedia.org/wiki/Chinese_People%27s_Political_Consultative_Conference',
NULL);
