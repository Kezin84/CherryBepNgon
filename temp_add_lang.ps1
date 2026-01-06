 = 'src/views/nhapHang.vue'
 = Get-Content -Raw 
 = '<option value= fil>[^<]+</option>'
if ( -notmatch ) { throw 'pattern missing' }
if (.Contains('Ti?ng Hàn (ko)')) { throw 'already there' }
 = '
                <option value=ko>Ti?ng Hàn (ko)</option>'
 = [regex]::Replace(, , , 1)
Set-Content -Path  -Value 
