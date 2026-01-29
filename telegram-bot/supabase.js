const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('SUPABASE_URL и SUPABASE_KEY должны быть указаны в .env файле');
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addHomework(title, description) {
  const { data, error } = await supabase
    .from('homework_bot')
    .insert([
      { 
        title: title,
        description: description
      }
    ])
    .select();

  if (error) {
    console.error('Ошибка добавления задания:', error);
    throw error;
  }

  return data[0];
}

async function getAllHomework() {
  const { data, error } = await supabase
    .from('homework_bot')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Ошибка получения заданий:', error);
    throw error;
  }

  return data;
}

module.exports = {
  supabase,
  addHomework,
  getAllHomework
};
