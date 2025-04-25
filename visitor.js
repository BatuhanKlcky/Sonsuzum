 <script src="https://unpkg.com/@supabase/supabase-js/dist/umd/supabase.js"></script>
  <script>
    const supabaseUrl = 'https://lvoeziofefbczugymzft.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2b2V6aW9mZWZiY3p1Z3ltemZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU1ODY1MjcsImV4cCI6MjA2MTE2MjUyN30.u9HyvUCxkchSmtwDzwAm2iy6yQiA7rScCQjKXCpq7XI'; // ← buraya kendi anon key'ini koy
    const client = supabase.createClient(supabaseUrl, supabaseKey);

    let visitStartTime = Date.now(); // giriş zamanı

    // IP adresini çek
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(ipData => {
        const pageUrl = window.location.href;
        const userAgent = navigator.userAgent;
        const screenResolution = `${window.screen.width}x${window.screen.height}`;
        const ipAddress = ipData.ip;

        // Sayfa kapatılmadan hemen önce veriyi gönder
        window.addEventListener('beforeunload', async function () {
          const visitEndTime = Date.now();
          const timeSpentSeconds = Math.floor((visitEndTime - visitStartTime) / 1000);

          const { data, error } = await client
            .from('visitor_logs')
            .insert([{
              page_url: pageUrl,
              ip_address: ipAddress,
              user_agent: userAgent,
              screen_resolution: screenResolution,
              time_spent: timeSpentSeconds
            }]);

          if (error) {
            console.error('❌ Hata:', error);
          } else {
            console.log('✅ Ziyaretçi kaydedildi:', data);
          }
        });
      });
  </script>
