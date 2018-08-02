Attribute VB_Name = "Module1"
Sub parseStock()
    Dim tickerName As String
    Dim stockVolume, yearOpen, yearClose As Double
    Dim indexTable, numRows As Long
    Dim grtPctInc, grtPctDcs, grtTotVol As Double
    Dim iIndex As Integer
    Dim ws As Excel.Worksheet
    
    For iIndex = 1 To ActiveWorkbook.Worksheets.Count
        Set ws = Worksheets(iIndex)
        ws.Activate
        
        Range("I1").Value = "Ticker"
        Range("J1").Value = "Total Stock Volume"
        Range("K1").Value = "Yearly Change"
        Range("L1").Value = "Percent Change"
        Range("P1").Value = "Ticker"
        Range("Q1").Value = "Value"
        Range("O2").Value = "Greatest % Increase"
        Range("O3").Value = "Greatest % Decrease"
        Range("O4").Value = "Greatest Total Volume"
        numRows = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
        'MsgBox ("Num Rows is " & numRows)
        tickerName = ""
        indexTable = 2
        For i = 2 To (numRows + 1) 'Add 1 to get make last row print
            If (tickerName <> Cells(i, 1).Value) Then
                If (tickerName <> "") Then 'Protect against initial entry to for loop
                    'Calculate entries for output
                    Cells(indexTable - 1, 10).Value = stockVolume
                    yearClose = Cells(i - 1, 6).Value
                    Cells(indexTable - 1, 11).Value = yearClose - yearOpen
                    If (Cells(indexTable - 1, 11).Value >= 0) Then
                        Cells(indexTable - 1, 11).Interior.Color = vbGreen
                    Else
                        Cells(indexTable - 1, 11).Interior.Color = vbRed
                    End If
                    If (yearOpen <> 0) Then
                        Cells(indexTable - 1, 12).Value = (yearClose - yearOpen) / yearOpen
                        Cells(indexTable - 1, 12).NumberFormat = "0.00%"
                    Else
                        Cells(indexTable - 1, 12).Value = 0
                    End If
                End If
                'Intialize output values
                tickerName = Cells(i, 1).Value
                yearOpen = Cells(i, 3).Value
                Cells(indexTable, 9) = tickerName
                stockVolume = Cells(i, 7).Value
                indexTable = indexTable + 1
            Else
                stockVolume = stockVolume + Cells(i, 7).Value
            End If
        Next i
        
        grtPctInc = 0
        grtPctDcs = 0
        grtTotVol = 0
        
        Cells(2, 17).NumberFormat = "0.00%"
        Cells(3, 17).NumberFormat = "0.00%"
        
        For i = 2 To indexTable
            If (Cells(i, 11).Value = "") Then
                Exit For
            End If
            
            If (grtPctInc < Cells(i, 12).Value) Then
                grtPctInc = Cells(i, 12).Value
                Cells(2, 16).Value = Cells(i, 9).Value
                Cells(2, 17).Value = Cells(i, 12).Value
            End If
            If (grtPctDcs > Cells(i, 12).Value) Then
                grtPctDcs = Cells(i, 12).Value
                Cells(3, 16).Value = Cells(i, 9).Value
                Cells(3, 17).Value = Cells(i, 12).Value
            End If
            If (grtTotVol < Cells(i, 10).Value) Then
                grtTotVol = Cells(i, 10).Value
                Cells(4, 16).Value = Cells(i, 9).Value
                Cells(4, 17).Value = Cells(i, 10).Value
            End If
        Next i
            
    Next iIndex
End Sub
