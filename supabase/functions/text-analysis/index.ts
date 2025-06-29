import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Basic list of English stop words.
const stopWords = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours',
  'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers',
  'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves',
  'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
  'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does',
  'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until',
  'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
  'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here',
  'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y'
]);

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json();
    console.log('Received request body:', body);
    const { article_id, mode, keyword } = body;

    if (!article_id || !mode) {
        return new Response(JSON.stringify({ error: 'article_id and mode are required' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: articleData, error: articleError } = await supabaseClient
      .from('theory_articles')
      .select('content')
      .eq('id', article_id)
      .single()

    if (articleError) throw articleError
    if (!articleData) throw new Error('Article not found')

    const text = articleData.content;

    if (mode === 'keywords') {
      // Correctly replace HTML tags with a space to prevent words from merging
      const words = text.toLowerCase().replace(/<[^>]+>/g, ' ').match(/\b\w+\b/g) || [];
      const wordCounts = words.reduce<Record<string, number>>((acc, word) => {
        if (!stopWords.has(word) && isNaN(parseInt(word))) {
          acc[word] = (acc[word] || 0) + 1;
        }
        return acc;
      }, {});

      const sortedKeywords = Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50) // Return top 50 keywords
        .map(([text, value]) => ({ text, value }));

      return new Response(JSON.stringify(sortedKeywords), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (mode === 'concordance') {
        if (!keyword) {
            return new Response(JSON.stringify({ error: 'keyword is required for concordance mode' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            })
        }
        // Split text into sentences. This is a simple regex and might not be perfect for all cases.
        const sentences = text.replace(/<[^>]+>/g, ' ').match(/[^.!?]+[.!?]+/g) || [];
        // Use a more robust method for finding the keyword in a sentence
        const matchingSentences = sentences.filter(sentence => {
            // Create a clean, lowercase array of words from the sentence
            const wordsInSentence = sentence.toLowerCase().match(/\b\w+\b/g) || [];
            // Check if the keyword (which is already lowercase) is in the array
            return wordsInSentence.includes(keyword);
        });

        return new Response(JSON.stringify(matchingSentences), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }

    return new Response(JSON.stringify({ error: 'Invalid mode specified' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
