!macro customInstall 
    DetailPrint "Register togetherstalk URI Handler" 
    DeleteRegKey HKCR "ranking" 
    WriteRegStr HKCR "ranking" "" "URL:togetherstalk" 
    WriteRegStr HKCR "ranking" "URL Protocol" "" 
    WriteRegStr HKCR "ranking\DefaultIcon" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME}" 
    WriteRegStr HKCR "ranking\shell" "" "" 
    WriteRegStr HKCR "ranking\shell\Open" "" "" 
    WriteRegStr HKCR "ranking\shell\Open\command" "" "$INSTDIR\${APP_EXECUTABLE_FILENAME} %1" 
!macroend