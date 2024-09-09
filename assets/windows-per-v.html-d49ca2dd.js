import{_ as e,o as i,c as n,f as s}from"./app-470db377.js";const t={},a=s(`<p>执行以下bat:</p><div class="language-bat line-numbers-mode" data-ext="bat"><pre class="language-bat"><code>pushd &quot;%~dp0&quot;

dir /b %SystemRoot%\\\\servicing\\\\Packages\\*Hyper-V\\*.mum &gt;hyper-v.txt

for /f %%i in (&#39;findstr /i . hyper-v.txt 2^&gt;nul&#39;) do dism /online /norestart /add-package:&quot;%SystemRoot%\\\\servicing\\\\Packages\\\\%%i&quot;

del hyper-v.txt

Dism /online /enable-feature /featurename:Microsoft-Hyper-V-All /LimitAccess /ALL
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,2),d=[a];function r(l,c){return i(),n("div",null,d)}const v=e(t,[["render",r],["__file","windows-per-v.html.vue"]]);export{v as default};
