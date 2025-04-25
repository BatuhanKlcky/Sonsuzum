<!-- Supabase kütüphanesini dahil et -->
<script src="https://unpkg.com/@supabase/supabase-js@2.42.5/dist/umd/supabase.js"></script>

<script>
  const supabaseUrl = 'https://lvoeziofefbczugymzft.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2b2V6aW9mZWZiY3p1Z3ltemZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1ODY1MjcsImV4cCI6MjA2MTE2MjUyN30.u9HyvUCxkchSmtwDzwAm2iy6yQiA7rScCQjKXCpq7XI';
  const client = supabase.createClient(supabaseUrl, supabaseKey);

  let visitStart = Date.now();

  // IP adresini al
  fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(ipData => {
      const page_url = window.location.href;
      const user_agent = navigator.userAgent;
      const screen_resolution = `${window.screen.width}x${window.screen.height}`;
      const ip_address = ipData.ip;

      // Sayfa kapanınca ziyaret kaydet
      window.addEventListener('beforeunload', async () => {
        const visitEnd = Date.now();
        const time_spent = Math.floor((visitEnd - visitStart) / 1000);

        const { error } = await client
          .from('visitor_logs')
          .insert([{
            page_url,
            ip_address,
            user_agent,
            screen_resolution,
            time_spent
          }]);

        if (error) {
          console.error('Ziyaretçi kaydedilirken hata:', error);
        } else {
          console.log('Ziyaret kaydedildi!');
        }
      });
    });
</script>
