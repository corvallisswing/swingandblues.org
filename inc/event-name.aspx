<% If Request.Url.Host = "bluesandswing.org"
	Response.Write("Corvallis Blues and Swing Weekend")
Else 
	Response.Write("Corvallis Swing and Blues Weekend")
End If
%>