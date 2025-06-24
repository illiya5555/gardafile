import
 { serve } 
from
 
"https://deno.land/std@0.168.0/http/server.ts"
;
import
 { createClient } 
from
 
'https://esm.sh/@supabase/supabase-js@2'
;
import
 Stripe 
from
 
'https://esm.sh/stripe@14.5.0'
;
serve(
async
 (req) => {
  
const
 supabaseUrl = Deno.env.get(
'PROJECT_URL'
);
  
const
 supabaseServiceKey = Deno.env.get(
'SUPABASE_SERVICE_ROLE_KEY'
);
  
const
 stripeSecretKey = Deno.env.get(
'STRIPE_SECRET_KEY'
);
  
const
 supabase = createClient(supabaseUrl, supabaseServiceKey);
  
const
 stripe = 
new
 Stripe(stripeSecretKey, { 
apiVersion
: 
'2023-10-16'
 });
  
try
 {
    
const
 { booking_type, date, time_slot, participants, total_price } = 
await
 req.json();
    
const
 session = 
await
 stripe.checkout.sessions.create({
      
payment_method_types
: [
'card'
],
      
line_items
: [{
        
price_data
: {
          
currency
: 
'usd'
,
          
product_data
: {
            
name
: 
`Booking for 
${booking_type}
`
,
          },
          
unit_amount
: total_price * 
100
, 
// Amount in cents

        },
        
quantity
: participants,
      }],
      
mode
: 
'payment'
,
      
success_url
: 
'https://your-success-url.com'
,
      
cancel_url
: 
'https://your-cancel-url.com'
,
    });
    
return
 
new
 Response(
JSON
.stringify({ 
id
: session.id }), {
      
status
: 
200
,
      
headers
: { 
'Content-Type'
: 
'application/json'
 },
    });
  } 
catch
 (error) {
    
console
.error(
'Error creating checkout session:'
, error);
    
return
 
new
 Response(
JSON
.stringify({ 
error
: 
'Failed to create checkout session'
 }), {
      
status
: 
500
,
      
headers
: { 
'Content-Type'
: 
'application/json'
 },
    });
  }
});