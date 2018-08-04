Sub parseStockData()
    Dim tickerName As String
    Dim stockVolume, yearOpen, yearClose As Double
    Dim indexTable, numRows As Long
    Dim grtPctInc, grtPctDcs, grtTotVol As Double
    Dim iIndex As Integer
    Dim ws As Excel.Worksheet
    
    Dim StartTime As Double
    Dim SecondsElapsed As Double
    StartTime = Timer

    ' For challenge
    For iIndex = 1 To ActiveWorkbook.Worksheets.Count
        Set ws = Worksheets(iIndex)
        ws.Activate
        
        numRows = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row
        parseSheet (numRows)
           
    Next iIndex
    'Determine how many seconds code took to run
    SecondsElapsed = Round(Timer - StartTime, 2)

    'Notify user in seconds
    MsgBox "This code ran successfully in " & SecondsElapsed & " seconds", vbInformation
    
End Sub
Function parseSheet(numRows As Long)
    Dim stockVolume, yearOpen, yearClose As Double
    Dim indexTable As Long
    Dim grtPctInc, grtPctDcs, grtTotVol As Double
    
    Range("I1").Value = "Ticker"
    Range("J1").Value = "Total Stock Volume"
    Range("K1").Value = "Yearly Change"
    Range("L1").Value = "Percent Change"
    Range("P1").Value = "Ticker"
    Range("Q1").Value = "Value"
    Range("O2").Value = "Greatest % Increase"
    Range("O3").Value = "Greatest % Decrease"
    Range("O4").Value = "Greatest Total Volume"
    ' Format Cells
    Cells(2, 17).NumberFormat = "0.00%"
    Cells(3, 17).NumberFormat = "0.00%"
    
    'Initial value settings
    tickerName = Cells(2, 1).Value
    stockVolume = Cells(2, 7).Value
    yearOpen = Cells(2, 3).Value
    yearClose = Cells(2, 6).Value
    indexTable = 2
    
    grtPctInc = 0
    grtPctDcs = 0
    grtTotVol = 0
    
    For i = 2 To (numRows + 1) 'Add 1 to get make last row print
        If (tickerName <> Cells(i, 1).Value) Then
            'New ticker, record old ticker values
            'Gen Easy Data
            Cells(indexTable, 9) = tickerName
            Cells(indexTable, 10).Value = stockVolume
            'Gen Mod Data
            yearClose = Cells((i - 1), 6).Value
            Cells(indexTable, 11).Value = yearClose - yearOpen
            If (Cells(indexTable, 11).Value >= 0) Then
                Cells(indexTable, 11).Interior.Color = vbGreen
            Else
                Cells(indexTable, 11).Interior.Color = vbRed
            End If
            If (yearOpen <> 0) Then
                Cells(indexTable, 12).Value = (yearClose - yearOpen) / yearOpen
                Cells(indexTable, 12).NumberFormat = "0.00%"
            Else
                Cells(indexTable, 12).Value = 0
            End If
            'Gen Hard Data
            If (grtPctInc < Cells(indexTable, 12).Value) Then
                grtPctInc = Cells(indexTable, 12).Value
                Cells(2, 16).Value = Cells(indexTable, 9).Value
                Cells(2, 17).Value = Cells(indexTable, 12).Value
            End If
            If (grtPctDcs > Cells(indexTable, 12).Value) Then
                grtPctDcs = Cells(indexTable, 12).Value
                Cells(3, 16).Value = Cells(indexTable, 9).Value
                Cells(3, 17).Value = Cells(indexTable, 12).Value
            End If
            If (grtTotVol < Cells(indexTable, 10).Value) Then
                grtTotVol = Cells(indexTable, 10).Value
                Cells(4, 16).Value = Cells(indexTable, 9).Value
                Cells(4, 17).Value = Cells(indexTable, 10).Value
            End If
            If (tickerName <> "") Then
                'Intialize output values for new Ticker
                tickerName = Cells(i, 1).Value
                yearOpen = Cells(i, 3).Value
                stockVolume = Cells(i, 7).Value
                indexTable = indexTable + 1
            End If
            
        Else
            'Same ticker keep accumulating stock volume
            stockVolume = stockVolume + Cells(i, 7).Value
        End If
    Next i
End Function
