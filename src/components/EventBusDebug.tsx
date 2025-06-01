'use client';

import { useState, useEffect } from 'react';
import { eventBus, EventType } from '../utils/eventBus';
import { Activity, X, Eye, EyeOff, Trash2, BarChart3 } from 'lucide-react';

interface EventHistory {
  event: EventType;
  payload: any;
  timestamp: Date;
}

export default function EventBusDebug() {
  const [isVisible, setIsVisible] = useState(false);
  const [history, setHistory] = useState<EventHistory[]>([]);
  const [stats, setStats] = useState<any>({});
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setHistory(eventBus.getHistory());
      setStats(eventBus.getStats());
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const refreshData = () => {
    setHistory(eventBus.getHistory());
    setStats(eventBus.getStats());
  };

  const clearHistory = () => {
    // This would need a method in eventBus to clear history
    setHistory([]);
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <>
      {/* Debug Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 z-50 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition-colors"
        title="EventBus Debug"
      >
        <Activity className="w-5 h-5" />
      </button>

      {/* Debug Panel */}
      {isVisible && (
        <div className="fixed bottom-16 left-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 w-96 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="bg-purple-600 text-white p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span className="font-medium">EventBus Debug</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="p-1 hover:bg-purple-700 rounded"
                title={autoRefresh ? 'Desabilitar atualização automática' : 'Habilitar atualização automática'}
              >
                {autoRefresh ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={refreshData}
                className="p-1 hover:bg-purple-700 rounded"
                title="Atualizar dados"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-purple-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <h4 className="font-medium text-gray-900 mb-2">Estatísticas</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Total Listeners:</span>
                <span className="ml-1 font-medium">{stats.totalListeners || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Eventos no Histórico:</span>
                <span className="ml-1 font-medium">{stats.eventsInHistory || 0}</span>
              </div>
            </div>
            
            {stats.listenersByEvent && Object.keys(stats.listenersByEvent).length > 0 && (
              <div className="mt-2">
                <span className="text-gray-600 text-xs">Listeners por Evento:</span>
                <div className="mt-1 max-h-20 overflow-y-auto">
                  {Object.entries(stats.listenersByEvent).map(([event, count]) => (
                    <div key={event} className="text-xs flex justify-between">
                      <span className="text-gray-700 truncate">{event}</span>
                      <span className="font-medium ml-2">{count as number}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* History */}
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Histórico de Eventos</h4>
              <button
                onClick={clearHistory}
                className="p-1 hover:bg-gray-100 rounded text-gray-500"
                title="Limpar histórico"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            
            <div className="max-h-48 overflow-y-auto space-y-2">
              {history.length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-4">Nenhum evento ainda</p>
              ) : (
                history.slice().reverse().map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded p-2 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-purple-600">{item.event}</span>
                      <span className="text-gray-500">
                        {item.timestamp.toLocaleTimeString('pt-BR')}
                      </span>
                    </div>
                    <div className="text-gray-700 bg-gray-50 rounded p-1 max-h-16 overflow-y-auto">
                      <pre className="text-xs">
                        {JSON.stringify(item.payload, null, 1)}
                      </pre>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 